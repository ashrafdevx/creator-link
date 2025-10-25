import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Upload } from 'lucide-react';

const SUGGESTED_QUESTIONS = [
  "Why do you think you're a good fit for this job?",
  "Tell me about your experience with YouTube content like this.",
  "Share examples of your past work that show you're qualified for this role.",
  "What's your typical turnaround time for projects like this?",
  "How do you usually communicate with clients?",
  "How do you handle revision requests?",
  "Are you comfortable signing an NDA if required?",
  "What's your ideal working style or collaboration process?"
];

export default function ApplicationQuestions({ questions, onChange }) {
  const [customQuestion, setCustomQuestion] = useState('');
  const [selectedSuggested, setSelectedSuggested] = useState([]);

  const handleToggleSuggested = (question) => {
    const isSelected = selectedSuggested.includes(question);
    let newSelected;
    if (isSelected) {
      newSelected = selectedSuggested.filter(q => q !== question);
    } else {
      newSelected = [...selectedSuggested, question];
    }
    setSelectedSuggested(newSelected);
    
    // Update parent component
    const allQuestions = [
      ...newSelected.map(q => ({ question_text: q, is_required: true })),
      ...questions.filter(q => !SUGGESTED_QUESTIONS.includes(q.question_text))
    ];
    onChange(allQuestions);
  };

  const handleAddCustom = () => {
    if (customQuestion.trim()) {
      const newQuestions = [...questions, { question_text: customQuestion.trim(), is_required: true }];
      onChange(newQuestions);
      setCustomQuestion('');
    }
  };

  const handleRemoveCustom = (index) => {
    const questionToRemove = questions[index];
    if (!SUGGESTED_QUESTIONS.includes(questionToRemove.question_text)) {
      const newQuestions = questions.filter((_, i) => i !== index);
      onChange(newQuestions);
    }
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Application Questions</CardTitle>
        <p className="text-slate-300 text-sm">Choose questions for applicants to answer</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Suggested Questions */}
        <div>
          <h4 className="font-medium text-slate-200 mb-3">Suggested Questions</h4>
          <div className="space-y-2">
            {SUGGESTED_QUESTIONS.map((question, index) => (
              <label key={index} className="flex items-start gap-3 p-3 rounded-lg border border-slate-600 hover:bg-slate-700/30 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedSuggested.includes(question)}
                  onChange={() => handleToggleSuggested(question)}
                  className="mt-1"
                />
                <span className="text-slate-200 text-sm">{question}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Custom Questions */}
        <div>
          <h4 className="font-medium text-slate-200 mb-3">Custom Questions</h4>
          <div className="flex gap-2 mb-3">
            <Input
              placeholder="Add your own question..."
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustom())}
            />
            <Button type="button" onClick={handleAddCustom} variant="outline">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Display custom questions */}
          <div className="space-y-2">
            {questions.filter(q => !SUGGESTED_QUESTIONS.includes(q.question_text)).map((question, index) => (
              <div key={index} className="flex items-center gap-2 p-3 bg-slate-700/50 rounded-lg">
                <span className="flex-1 text-slate-200 text-sm">{question.question_text}</span>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRemoveCustom(questions.indexOf(question))}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        {questions.length > 0 && (
          <div className="p-3 bg-blue-900/20 rounded-lg border border-blue-700/50">
            <p className="text-blue-300 text-sm">
              {questions.length} question{questions.length !== 1 ? 's' : ''} will be shown to applicants
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}