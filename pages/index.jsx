import { useState, useEffect } from 'react';

export default function App() {
  const [selectedGroup, setSelectedGroup] = useState('parentAndTot');
  const [selectedLevel, setSelectedLevel] = useState('parentAndTot1');
  const [isLoading, setIsLoading] = useState(false);
  const [editingLessonIndex, setEditingLessonIndex] = useState(null);
  const [editingSkills, setEditingSkills] = useState([]);

  // Cleaned lesson data – only 10 weeks per level
  const initialLessonData = {
    parentAndTot1: Array.from({ length: 10 }, (_, i) => ({
      week: i + 1,
      skills: [
        'Enter and exit the water safely with tot',
        'Hold tot on front, eye contact',
        'Hold tot on back, head and back support',
        'Front float (face out) – assisted',
        'Back float (assisted)',
        'Arms: splashing, reaching, paddling, on front and back',
        'Legs: tickling, splashing, kicking, on front and back',
        'Water Smart message: Swim to Survive',
      ],
      notes: '',
      aiDrills: [],
    })),
    parentAndTot2: Array.from({ length: 10 }, (_, i) => ({
      week: i + 1,
      skills: [
        'Entry from sitting position (assisted)',
        'Exit the water (assisted)',
        'Blow bubbles on and in water',
        'Face wet and in water',
        'Front float (face in) – assisted',
        'Back float (assisted)',
        'Kicking on front (assisted)',
        'Kicking on back (assisted)',
        'Water Smart message: Within Arms’ Reach',
        'Water Smart message: Wear a Lifejacket',
      ],
      notes: '',
      aiDrills: [],
    })),
    swimmer1: Array.from({ length: 10 }, (_, i) => ({
      week: i + 1,
      skills: [
        'Enter and exit shallow water',
        'Hold breath underwater 5 sec.',
        'Submerge and exhale 5 times',
        'Open eyes underwater',
        'Float on front 5 sec.',
        'Float on back 5 sec.',
        'Glide on front 3 m',
        'Glide on back 3 m',
        'Water Smart message: Swim with a Buddy',
      ],
      notes: '',
      aiDrills: [],
    })),
  };

  const [lessonData, setLessonData] = useState(() => {
    const saved = localStorage.getItem('swimLessonData');
    return saved ? JSON.parse(saved) : initialLessonData;
  });

  useEffect(() => {
    localStorage.setItem('swimLessonData', JSON.stringify(lessonData));
  }, [lessonData]);

  const levelGroups = {
    parentAndTot: {
      label: 'Parent & Tot',
      levels: {
        parentAndTot1: 'Parent & Tot 1',
        parentAndTot2: 'Parent & Tot 2',
        parentAndTot3: 'Parent & Tot 3',
      },
    },
    preschool: {
      label: 'Preschool',
      levels: {
        preschool1: 'Preschool 1',
        preschool2: 'Preschool 2',
        preschool3: 'Preschool 3',
        preschool4: 'Preschool 4',
        preschool5: 'Preschool 5',
      },
    },
    swimmer: {
      label: 'Swimmer',
      levels: {
        swimmer1: 'Swimmer 1',
        swimmer2: 'Swimmer 2',
        swimmer3: 'Swimmer 3',
        swimmer4: 'Swimmer 4',
        swimmer5: 'Swimmer 5',
        swimmer6: 'Swimmer 6',
      },
    },
  };

  const groupOptions = Object.keys(levelGroups).map((key) => ({
    value: key,
    label: levelGroups[key].label,
  }));

  const levelOptions = Object.keys(levelGroups[selectedGroup].levels).map((key) => ({
    value: key,
    label: levelGroups[selectedGroup].levels[key],
  }));

  const currentLessons = lessonData[selectedLevel] || [];

  const handleGroupChange = (e) => {
    const newGroup = e.target.value;
    setSelectedGroup(newGroup);
    const firstLevel = Object.keys(levelGroups[newGroup].levels)[0];
    setSelectedLevel(firstLevel);
  };

  const handleLevelChange = (e) => {
    setSelectedLevel(e.target.value);
  };

  const handleAddLesson = () => {
    if (currentLessons.length >= 10) {
      alert('Maximum 10 lessons allowed.');
      return;
    }
    const newWeek = currentLessons.length + 1;
    const newLesson = {
      week: newWeek,
      skills: ['New Skill'],
      notes: '',
      aiDrills: [],
    };
    setLessonData({
      ...lessonData,
      [selectedLevel]: [...currentLessons, newLesson],
    });
  };

  const handleEditLesson = (lessonIndex) => {
    setEditingLessonIndex(lessonIndex);
    setEditingSkills([...currentLessons[lessonIndex].skills]);
  };

  const handleSaveLesson = () => {
    const updated = currentLessons.map((lesson, i) =>
      i === editingLessonIndex ? { ...lesson, skills: [...editingSkills] } : lesson
    );
    setLessonData({ ...lessonData, [selectedLevel]: updated });
    setEditingLessonIndex(null);
  };

  const handleCancelEdit = () => {
    setEditingLessonIndex(null);
  };

  const handleRemoveSkill = (skillIndex) => {
    if (editingSkills.length <= 1) {
      alert('A lesson must have at least one skill.');
      return;
    }
    setEditingSkills(editingSkills.filter((_, i) => i !== skillIndex));
  };

  const handleDeleteLesson = (lessonIndex) => {
    if (window.confirm('Delete this lesson?')) {
      const updated = currentLessons.filter((_, i) => i !== lessonIndex);
      const renumbered = updated.map((l, i) => ({ ...l, week: i + 1 }));
      setLessonData({ ...lessonData, [selectedLevel]: renumbered });
    }
  };

  const handlePrintLesson = (lessonIndex) => {
    const lesson = currentLessons[lessonIndex];
    let content = `Lesson ${lesson.week}\n\nSkills:\n`;
    lesson.skills.forEach((skill, i) => {
      content += `- ${skill}\n`;
      if (lesson.aiDrills?.[i]) content += `  🔹 ${lesson.aiDrills[i]}\n`;
    });
    content += `\nNotes: ${lesson.notes || 'None'}`;

    const win = window.open('', '_blank');
    win.document.write(`
      <html>
        <head><title>Lesson ${lesson.week}</title></head>
        <body style="font-family:Arial;padding:20px;">
          <pre>${content}</pre>
        </body>
      </html>
    `);
    win.document.close();
    setTimeout(() => win.print(), 500);
  };

  const handlePrintAll = () => {
    let fullContent = 'SWIM FOR LIFE - LESSON PLAN\n\n';
    currentLessons.forEach(lesson => {
      fullContent += `Lesson ${lesson.week}\n\nSkills:\n`;
      lesson.skills.forEach((skill, i) => {
        fullContent += `- ${skill}\n`;
        if (lesson.aiDrills?.[i]) fullContent += `  🔹 ${lesson.aiDrills[i]}\n`;
      });
      fullContent += `\n---\n\n`;
    });

    const win = window.open('', '_blank');
    win.document.write(`
      <html>
        <head><title>All Lessons</title></head>
        <body style="font-family:Arial;padding:20px;">
          <pre>${fullContent}</pre>
        </body>
      </html>
    `);
    win.document.close();
    setTimeout(() => win.print(), 500);
  };

  const handleExport = () => {
    let fullContent = 'SWIM FOR LIFE - LESSON PLAN\n\n';
    currentLessons.forEach(lesson => {
      fullContent += `Lesson ${lesson.week}\nSkills:\n${lesson.skills.join('\n')}\n`;
      if (lesson.aiDrills?.length) fullContent += `Drills:\n${lesson.aiDrills.join('\n')}\n`;
      fullContent += `---\n\n`;
    });

    const blob = new Blob([fullContent], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${levelGroups[selectedGroup].levels[selectedLevel]}_plan.txt`;
    link.click();
  };

  const handleAIGenerate = async (lessonIndex) => {
    const lesson = currentLessons[lessonIndex];
    const levelName = levelGroups[selectedGroup].levels[selectedLevel];
    const mustSees = [
      'Always supervise children around water',
      'Use PFDs when appropriate',
      'Teach Water Smart messages each class',
      'Encourage fun and confidence over perfection',
      'Progress skills gradually based on readiness'
    ];

    setIsLoading(true);
    try {
      const response = await fetch('/api/generate-drill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level: levelName, skills: lesson.skills, mustSees }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      const updatedLessons = currentLessons.map((l, i) =>
        i === lessonIndex ? { ...l, aiDrills: data.drills } : l
      );

      setLessonData({ ...lessonData, [selectedLevel]: updatedLessons });
    } catch (err) {
      alert('AI failed: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-5xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-blue-700 mb-2">Swim for Life - Lesson Planner</h1>
        <p className="text-blue-600 mb-6">Lifesaving Society | Edits saved automatically</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">Select Group</label>
            <select
              value={selectedGroup}
              onChange={handleGroupChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            >
              {groupOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Select Level</label>
            <select
              value={selectedLevel}
              onChange={handleLevelChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            >
              {levelOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={handlePrintAll}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
          >
            🖨 Print All
          </button>
          <button
            onClick={handleExport}
            className="bg-green-100 text-green-700 px-4 py-2 rounded hover:bg-green-200 flex items-center gap-2"
          >
            📄 Export TXT
          </button>
          <button
            onClick={handleAddLesson}
            disabled={currentLessons.length >= 10}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 disabled:opacity-50"
          >
            + Add Lesson
          </button>
        </div>

        <div className="space-y-4">
          {currentLessons.map((lesson, lessonIndex) => (
            <div key={lesson.week} className="border p-4 rounded bg-blue-50">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-blue-700">Lesson {lesson.week}</h3>
                <div className="flex gap-1 text-sm">
                  <button
                    onClick={() => handleEditLesson(lessonIndex)}
                    className="text-blue-600 hover:underline"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleAIGenerate(lessonIndex)}
                    disabled={isLoading}
                    className="text-purple-600 hover:underline disabled:opacity-60"
                  >
                    {isLoading ? '...' : '💡 Suggest Drills'}
                  </button>
                  <button
                    onClick={() => handlePrintLesson(lessonIndex)}
                    className="text-green-600 hover:underline"
                  >
                    🖨 Print
                  </button>
                  <button
                    onClick={() => handleDeleteLesson(lessonIndex)}
                    className="text-red-600 hover:underline"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>

              {editingLessonIndex === lessonIndex ? (
                <div className="bg-white p-3 rounded border mb-3 space-y-2">
                  {editingSkills.map((skill, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={skill}
                        onChange={(e) => {
                          const updated = [...editingSkills];
                          updated[i] = e.target.value;
                          setEditingSkills(updated);
                        }}
                        className="flex-1 p-1 border rounded text-sm"
                      />
                      <button
                        onClick={() => handleRemoveSkill(i)}
                        disabled={editingSkills.length <= 1}
                        className="text-red-500 disabled:text-gray-300"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => setEditingSkills([...editingSkills, ''])}
                      className="text-sm text-green-600 underline"
                    >
                      ➕ Add Skill
                    </button>
                    <button
                      onClick={handleSaveLesson}
                      className="text-sm text-green-600 underline"
                    >
                      ✔️ Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="text-sm text-gray-600 underline"
                    >
                      ❌ Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <ul className="list-disc pl-5 text-sm space-y-2">
                  {lesson.skills.map((s, i) => (
                    <li key={i} className="text-gray-700">
                      {s}
                      {lesson.aiDrills && lesson.aiDrills[i] && (
                        <div className="ml-4 mt-1 text-xs bg-yellow-50 p-2 rounded border-l-2 border-yellow-400 text-yellow-800 leading-tight">
                          {lesson.aiDrills[i]}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
