// props: { questions: Array, value: Array, onChange: Function }
const ApplicationQuestionsInput = ({
  questions = [],
  value = [],
  onChange,
}) => {
  // keep responses in the same order as questions
  const handleAnswerChange = (idx, answer) => {
    const next = [...value];
    next[idx] = {
      // store both for your submit payload convenience
      question_text: questions[idx]?.question_text || "",
      answer: answer,
    };
    onChange(next);
  };

  return (
    <div className="space-y-4">
      {questions.map((q, idx) => (
        <div key={q._id || idx} className="space-y-2">
          <label className="block text-sm text-slate-300">
            {q.question_text}
            {q.is_required && <span className="text-red-400"> *</span>}
          </label>
          <textarea
            className="w-full rounded-md bg-slate-800/60 border border-slate-700 text-slate-200 p-3 outline-none focus:border-slate-500"
            rows={3}
            value={value[idx]?.answer || ""}
            onChange={(e) => handleAnswerChange(idx, e.target.value)}
          />
        </div>
      ))}
    </div>
  );
};

export default ApplicationQuestionsInput;
