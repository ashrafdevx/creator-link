import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

export default function TagInput({ tags = [], onChange, placeholder = "Type and press Enter" }) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    // Check if tag already exists (case-insensitive)
    const exists = tags.some((tag) => tag.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      setInputValue("");
      return;
    }

    onChange([...tags, trimmed]);
    setInputValue("");
  };

  const removeTag = (indexToRemove) => {
    onChange(tags.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="space-y-2">
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
      />
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <Badge
              key={index}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 text-sm flex items-center gap-1.5"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(index)}
                className="hover:bg-blue-800 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
