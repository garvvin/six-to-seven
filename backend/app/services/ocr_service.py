import fitz  # PyMuPDF
import json
import re
import os
from typing import Dict, Any, Optional
import logging

class OCRService:
    def __init__(self):
        # Comprehensive regex patterns for medical form parsing
        self.patterns = {
            'doc_type': r'(?i)(?:EMR\s+)?(?:Downtime\s+)?(?:Office\s+)?(?:Visit\s+)?(?:Form|Note|Document)',
            'location': r'(?i)location\s+of\s+care\s*:?\s*([^\n\r]+)',
            'date': r'(?i)date\s+of\s+service\s*:?\s*([^\n\r]+)',
            'visit_type': r'(?i)visit\s+type\s*:?\s*([^\n\r]+)',
            'patient_name': r'(?i)patient\s+name\s*:?\s*([^\n\r]+)',
            'blood_pressure': r'(?i)blood\s+pressure\s*(\d{2,3}[/-]\d{2,3})',
            'pulse_rate': r'(?i)pulse\s+rate\s*(\d+)',
            'resp_rate': r'(?i)resp\s+rate\s*(\d+)',
            'temperature': r'(?i)(?:temp|temperature)(?:/|:|\s+method)?\s*(\d+\.?\d*)\s*([FC])?',
            'chief_complaint': r'(?i)chief\s+complaint\s*([^\n\r]+)',
            'impression': r'(?i)impression/?diagnosis\s*([^\n\r]+)',
            'staff_name': r'(?i)clinical\s+staff\s*\(print\s+name\)\s*:?\s*([^\n\r]+)',
            'signature': r'(?i)clinical\s+staff\s+signature\s*([^\n\r]+)',
        }
        
    def extract_text_from_bytes(self, pdf_bytes: bytes) -> str:
        """
        Extract text from PDF bytes using PyMuPDF
        """
        try:
            print(f"Opening PDF with {len(pdf_bytes)} bytes...")
            doc = fitz.open(stream=pdf_bytes, filetype="pdf")
            text = ""
            
            print(f"PDF has {len(doc)} pages")
            for page_num in range(len(doc)):
                page = doc.load_page(page_num)
                page_text = page.get_text()
                text += page_text
                print(f"Page {page_num + 1}: {len(page_text)} characters")
            
            doc.close()
            extracted_text = text.strip()
            print(f"Total extracted text: {len(extracted_text)} characters")
            print("First 500 characters:", extracted_text[:500])
            return extracted_text
            
        except Exception as e:
            print(f"Error extracting text from PDF: {e}")
            raise Exception(f"Failed to extract text from PDF: {str(e)}")
    
    def extract_field(self, text: str, pattern: str) -> Optional[str]:
        """
        Extract field value using regex pattern
        """
        try:
            match = re.search(pattern, text, re.MULTILINE | re.DOTALL | re.IGNORECASE)
            if match and match.groups():
                return match.group(1).strip()
            return None
        except Exception as e:
            print(f"Error extracting field with pattern {pattern}: {e}")
            return None
    
    def extract_medications(self, text: str) -> Dict[str, Any]:
        """
        Extract medication information
        """
        medications = {
            "unchanged_from_summary": None,
            "added_or_changed": None,
            "deleted": None
        }
        
        # Check for unchanged medications
        unchanged_match = re.search(r'(?i)medications?\s*:\s*unchanged\s+from\s+(?:attached\s+)?(?:chart\s+)?summary', text)
        if unchanged_match:
            medications["unchanged_from_summary"] = True
        
        # Extract added/changed medications
        added_section = re.search(r'(?i)medications?\s+added/?changed\s*([^☐☑✓]*?)(?=☐|$)', text, re.DOTALL)
        if added_section:
            added_text = added_section.group(1).strip()
            if added_text and added_text.lower() != 'n/a':
                medications["added_or_changed"] = [med.strip() for med in added_text.split('\n') if med.strip()]
        
        # Extract deleted medications
        deleted_section = re.search(r'(?i)medications?\s+deleted\s*([^☐☑✓]*?)(?=☐|$)', text, re.DOTALL)
        if deleted_section:
            deleted_text = deleted_section.group(1).strip()
            if deleted_text and deleted_text.lower() != 'n/a':
                medications["deleted"] = [med.strip() for med in deleted_text.split('\n') if med.strip()]
        
        return medications
    
    def extract_allergies(self, text: str) -> Dict[str, Any]:
        """
        Extract allergy information
        """
        allergies = {
            "unchanged_from_summary": None,
            "new_allergies": None
        }
        
        # Check for unchanged allergies
        unchanged_match = re.search(r'(?i)allergies?\s*☐\s*unchanged\s+from\s+(?:attached\s+)?summary', text)
        if unchanged_match:
            allergies["unchanged_from_summary"] = True
        
        # Extract new allergies
        new_allergies_section = re.search(r'(?i)new\s+allergies?\s*([^☐☑✓]*?)(?=☐|$)', text, re.DOTALL)
        if new_allergies_section:
            new_allergies_text = new_allergies_section.group(1).strip()
            if new_allergies_text and new_allergies_text.lower() != 'n/a':
                allergies["new_allergies"] = new_allergies_text
        
        return allergies
    
    def extract_hpi(self, text: str) -> Dict[str, Any]:
        """
        Extract HPI (History of Present Illness) information
        """
        hpi = {
            "symptoms_checked": None,
            "free_text": None
        }
        
        # Look for HPI section
        hpi_section = re.search(r'(?i)hpi\s*([^☐☑✓]*?)(?=review\s+of\s+systems|☐|$)', text, re.DOTALL)
        if hpi_section:
            hpi_text = hpi_section.group(1).strip()
            if hpi_text:
                # Split by lines and filter out empty ones
                symptoms = [symptom.strip() for symptom in hpi_text.split('\n') if symptom.strip()]
                if symptoms:
                    hpi["symptoms_checked"] = symptoms
        
        return hpi
    
    def extract_review_of_systems(self, text: str) -> Dict[str, Any]:
        """
        Extract Review of Systems information
        """
        ros = {
            "general": None,
            "ent": None,
            "neck": None,
            "head": None,
            "eyes": None,
            "chest": None
        }
        
        # Look for Review of Systems section
        ros_section = re.search(r'(?i)review\s+of\s+systems\s*([^☐☑✓]*?)(?=impression|☐|$)', text, re.DOTALL)
        if ros_section:
            ros_text = ros_section.group(1).strip()
            
            # Extract each system
            for system in ros.keys():
                pattern = rf'{system}\s*:\s*[□☐☑✓]\s*([^\n\r]+)'
                match = re.search(pattern, ros_text, re.IGNORECASE)
                if match:
                    status_text = match.group(1).strip()
                    # Normalize status
                    if re.search(r'(?i)(unremarkable|normal|negative)', status_text):
                        ros[system] = "unremarkable"
                    elif re.search(r'(?i)(abnormal|positive|remarkable)', status_text):
                        ros[system] = "abnormal"
        
        return ros
    
    def normalize_date(self, date_str: str) -> Dict[str, Any]:
        """
        Normalize date strings to YYYY-MM-DD format
        """
        if not date_str:
            return {"value": None, "raw": None}
        
        date_str = date_str.strip()
        
        # Handle redacted dates
        if '[redacted]' in date_str.lower():
            return {"value": None, "raw": date_str}
        
        # Try to find date pattern
        date_match = re.search(r'(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})', date_str)
        if date_match:
            try:
                month, day, year = date_match.groups()
                if len(year) == 2:
                    year = '20' + year if int(year) < 50 else '19' + year
                return {
                    "value": f"{year}-{month.zfill(2)}-{day.zfill(2)}",
                    "raw": date_str
                }
            except:
                pass
        
        return {"value": None, "raw": date_str}
    
    def normalize_blood_pressure(self, bp_str: str) -> Optional[str]:
        """
        Normalize blood pressure to S/D format
        """
        if not bp_str:
            return None
        
        # Look for BP pattern in the text
        bp_match = re.search(r'(\d{2,3})[/-](\d{2,3})', bp_str)
        if bp_match:
            return f"{bp_match.group(1)}/{bp_match.group(2)}"
        
        return None
    
    def normalize_temperature(self, temp_str: str) -> Dict[str, Any]:
        """
        Normalize temperature with unit and method
        """
        if not temp_str:
            return {"value": None, "unit": None, "method": None, "raw": None}
        
        temp_str = temp_str.strip()
        
        # Extract temperature value and unit
        temp_match = re.search(r'(\d+\.?\d*)\s*([FC])?', temp_str)
        if not temp_match:
            return {"value": None, "unit": None, "method": None, "raw": temp_str}
        
        try:
            value = float(temp_match.group(1))
            unit = temp_match.group(2) if temp_match.group(2) else None
            
            # Try to determine method from context
            method = None
            if re.search(r'(?i)(oral|po)', temp_str):
                method = "oral"
            elif re.search(r'(?i)(tympanic|ear)', temp_str):
                method = "tympanic"
            elif re.search(r'(?i)(temporal|forehead)', temp_str):
                method = "temporal"
            elif re.search(r'(?i)(axillary|armpit)', temp_str):
                method = "axillary"
            elif re.search(r'(?i)(rectal|rect)', temp_str):
                method = "rectal"
            
            return {
                "value": value,
                "unit": unit,
                "method": method,
                "raw": temp_str
            }
        except:
            return {"value": None, "unit": None, "method": None, "raw": temp_str}
    
    def check_signature_present(self, text: str) -> Optional[bool]:
        """
        Check if signature is present
        """
        if not text:
            return None
        
        # Look for signature indicators
        if re.search(r'(?i)(signed|signature|✓|☑)', text):
            return True
        elif re.search(r'(?i)(unsigned|no\s+signature|□|☐)', text):
            return False
        
        return None
    
    def ocr_text_to_json(self, ocr_text: str) -> Dict[str, Any]:
        """
        Convert OCR text to structured JSON using comprehensive parsing
        """
        try:
            print("Starting OCR text to JSON conversion...")
            print("OCR Text length:", len(ocr_text))
            
            # Extract basic fields
            doc_type = "EMR Downtime Office Visit Form"  # Default
            
            location = self.extract_field(ocr_text, self.patterns['location'])
            date_raw = self.extract_field(ocr_text, self.patterns['date'])
            visit_type = self.extract_field(ocr_text, self.patterns['visit_type'])
            patient_name = self.extract_field(ocr_text, self.patterns['patient_name'])
            
            # Extract vitals
            bp_raw = self.extract_field(ocr_text, self.patterns['blood_pressure'])
            pulse_raw = self.extract_field(ocr_text, self.patterns['pulse_rate'])
            resp_raw = self.extract_field(ocr_text, self.patterns['resp_rate'])
            temp_raw = self.extract_field(ocr_text, self.patterns['temperature'])
            
            # Extract other fields
            chief_complaint = self.extract_field(ocr_text, self.patterns['chief_complaint'])
            impression = self.extract_field(ocr_text, self.patterns['impression'])
            staff_name = self.extract_field(ocr_text, self.patterns['staff_name'])
            signature_raw = self.extract_field(ocr_text, self.patterns['signature'])
            
            # Extract complex fields
            medications = self.extract_medications(ocr_text)
            allergies = self.extract_allergies(ocr_text)
            hpi = self.extract_hpi(ocr_text)
            ros = self.extract_review_of_systems(ocr_text)
            
            # Build result
            result = {
                "doc_type": doc_type,
                "location_of_care": location,
                "date_of_service": self.normalize_date(date_raw),
                "visit_type": visit_type,
                "patient_name": {
                    "value": patient_name if patient_name and not self._looks_like_symptom(patient_name) else None,
                    "raw": patient_name
                },
                "vitals": {
                    "blood_pressure": self.normalize_blood_pressure(bp_raw) if bp_raw else None,
                    "pulse_rate": int(pulse_raw) if pulse_raw else None,
                    "resp_rate": int(resp_raw) if resp_raw else None,
                    "temperature": self.normalize_temperature(temp_raw) if temp_raw else None
                },
                "medications": medications,
                "allergies": allergies,
                "clinical_staff": {
                    "printed_name": staff_name if staff_name and '[redacted]' not in staff_name else None,
                    "signature_present": self.check_signature_present(signature_raw)
                },
                "chief_complaint": chief_complaint,
                "hpi": hpi,
                "review_of_systems": ros,
                "impression_or_diagnosis": impression,
                "source_quality_notes": f"Parsed using enhanced OCR with PyMuPDF. Raw text length: {len(ocr_text)} characters."
            }
            
            print("OCR processing completed successfully!")
            
            # Print to terminal as requested
            print("\n" + "="*50)
            print("OCR TEXT TO JSON RESULT:")
            print("="*50)
            print(json.dumps(result, indent=2, ensure_ascii=False))
            print("="*50 + "\n")
            
            return result
            
        except Exception as e:
            print(f"Error parsing OCR text: {e}")
            import traceback
            traceback.print_exc()
            raise Exception(f"Failed to parse OCR text: {str(e)}")
    
    def _looks_like_symptom(self, text: str) -> bool:
        """
        Check if text looks like a symptom rather than a name
        """
        if not text:
            return False
        
        symptom_keywords = [
            'pain', 'ache', 'fever', 'cough', 'shortness', 'breath', 'nausea',
            'vomiting', 'diarrhea', 'headache', 'dizziness', 'fatigue', 'weakness',
            'difficulty', 'wheezing', 'tightness'
        ]
        
        text_lower = text.lower()
        return any(keyword in text_lower for keyword in symptom_keywords)
    
    def process_pdf_to_json(self, pdf_bytes: bytes) -> Dict[str, Any]:
        """
        Complete pipeline: PDF -> Text -> JSON
        """
        print("Starting PDF to JSON processing...")
        
        # Step 1: Extract text from PDF
        ocr_text = self.extract_text_from_bytes(pdf_bytes)
        
        # Step 2: Convert text to JSON
        json_result = self.ocr_text_to_json(ocr_text)
        
        print("PDF to JSON processing completed!")
        return json_result
