import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Button } from './ui/button';
import {
  Brain,
  Loader2,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { healthInsightsService } from '../services/healthInsightsService';

const AIHealthInsights = ({ analysisResults, onInsightsGenerated }) => {
  const [generatingInsights, setGeneratingInsights] = React.useState(false);
  const [healthInsights, setHealthInsights] = React.useState(null);
  const [insightsError, setInsightsError] = React.useState(null);
  const [healthRecommendations, setHealthRecommendations] =
    React.useState(null);
  const [generatingRecommendations, setGeneratingRecommendations] =
    React.useState(false);
  const [recommendationsError, setRecommendationsError] = React.useState(null);

  const generateHealthInsights = async () => {
    if (analysisResults.length === 0) {
      setInsightsError(
        'No analysis results available to generate insights from'
      );
      return;
    }

    setGeneratingInsights(true);
    setInsightsError(null);
    setHealthInsights(null);

    try {
      // Use the first analysis result's data for insights
      const documentData = analysisResults[0].data;

      const result =
        await healthInsightsService.generateHealthInsights(documentData);

      if (result.success && result.data) {
        setHealthInsights(result.data);
        // Notify parent component
        if (onInsightsGenerated) {
          onInsightsGenerated(result.data);
        }
      } else {
        throw new Error(result.error || 'Failed to generate insights');
      }
    } catch (err) {
      console.error('Health insights generation error:', err);
      setInsightsError(err.message);
    } finally {
      setGeneratingInsights(false);
    }
  };

  const generateHealthRecommendations = async () => {
    if (analysisResults.length === 0) {
      setRecommendationsError(
        'No analysis results available to generate recommendations from'
      );
      return;
    }

    setGeneratingRecommendations(true);
    setRecommendationsError(null);
    setHealthRecommendations(null);

    try {
      // Use the first analysis result's data for recommendations
      const documentData = analysisResults[0].data;

      const result =
        await healthInsightsService.generateHealthRecommendations(documentData);

      if (result.success && result.data) {
        setHealthRecommendations(result.data);
      } else {
        throw new Error(result.error || 'Failed to generate recommendations');
      }
    } catch (err) {
      console.error('Health recommendations generation error:', err);
      setRecommendationsError(err.message);
    } finally {
      setGeneratingRecommendations(false);
    }
  };

  const clearInsights = () => {
    setHealthInsights(null);
    setInsightsError(null);
    setHealthRecommendations(null);
    setRecommendationsError(null);
  };

  const getPriorityColor = priority => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityIcon = priority => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'medium':
        return <Clock className="h-4 w-4 text-amber-600" />;
      case 'low':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <CheckCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  if (analysisResults.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Health Insights Section */}
      <Card className="bg-white/80 backdrop-blur-md border-gray-200 shadow-lg">
        <CardHeader>
          <div className="text-center flex flex-col gap-3">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-gray-800" />
              AI Health Insights
            </CardTitle>
            <CardDescription>
              AI-powered analysis of your medical documents
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Insights Error Display */}
          {insightsError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-800 mb-2">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">Error Generating Insights</span>
              </div>
              <p className="text-red-700 text-sm">{insightsError}</p>
            </div>
          )}

          {/* Dynamic Health Insights */}
          {healthInsights &&
          healthInsights.insights &&
          healthInsights.insights.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {healthInsights.insights.map((insight, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-md hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center shadow-sm">
                        <Brain className="h-4 w-4 text-gray-800" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {insight.title}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">
                      {insight.description}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex justify-center gap-3 pt-4">
                <Button
                  onClick={clearInsights}
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Clear Insights
                </Button>
                <Button
                  onClick={generateHealthInsights}
                  disabled={generatingInsights}
                  className="bg-gray-800 hover:bg-gray-900 text-white"
                >
                  {generatingInsights ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Regenerating...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Regenerate Insights
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            /* Default placeholder when no insights generated yet */
            <div className="text-center py-8">
              <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                Click "Get Health Insights" to get AI-powered health insights
                from your document analysis
              </p>
              <Button
                onClick={generateHealthInsights}
                disabled={generatingInsights}
                className="bg-gray-800 hover:bg-gray-900 text-white"
              >
                {generatingInsights ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Get Health Insights
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Health Recommendations Section */}
      {healthInsights && (
        <Card className="bg-white/80 backdrop-blur-md border-gray-200 shadow-lg">
          <CardHeader>
            <div className="text-center flex flex-col gap-3">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-gray-800" />
                AI Health Recommendations
              </CardTitle>
              <CardDescription>
                Actionable steps to improve your health
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Recommendations Error Display */}
            {recommendationsError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-red-800 mb-2">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">
                    Error Generating Recommendations
                  </span>
                </div>
                <p className="text-red-700 text-sm">{recommendationsError}</p>
              </div>
            )}

            {/* Dynamic Health Recommendations */}
            {healthRecommendations &&
            healthRecommendations.recommendations &&
            healthRecommendations.recommendations.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {healthRecommendations.recommendations.map(
                    (recommendation, index) => (
                      <div
                        key={index}
                        className="p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-md hover:shadow-lg transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center shadow-sm">
                              <CheckCircle className="h-4 w-4 text-gray-800" />
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {recommendation.title}
                            </span>
                          </div>
                          {recommendation.priority && (
                            <span
                              className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(recommendation.priority)}`}
                            >
                              {getPriorityIcon(recommendation.priority)}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700">
                          {recommendation.description}
                        </p>
                        {recommendation.priority && (
                          <div className="mt-2">
                            <span
                              className={`inline-block px-2 py-1 text-xs rounded-full border ${getPriorityColor(recommendation.priority)}`}
                            >
                              Priority: {recommendation.priority}
                            </span>
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>

                <div className="flex justify-center gap-3 pt-4">
                  <Button
                    onClick={() => {
                      setHealthRecommendations(null);
                      setRecommendationsError(null);
                    }}
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Clear Recommendations
                  </Button>
                  <Button
                    onClick={generateHealthRecommendations}
                    disabled={generatingRecommendations}
                    className="bg-gray-800 hover:bg-gray-900 text-white"
                  >
                    {generatingRecommendations ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Regenerating...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Regenerate Recommendations
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              /* Default placeholder when no recommendations generated yet */
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  Get personalized health recommendations based on your insights
                </p>
                <Button
                  onClick={generateHealthRecommendations}
                  disabled={generatingRecommendations}
                  className="bg-gray-800 hover:bg-gray-900 text-white"
                >
                  {generatingRecommendations ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Get Health Recommendations
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIHealthInsights;
