export function ClassicLayout({ data }) {
  const { personalInfo, experience, education, skills } = data;

  return (
    <div className="font-serif">
      {/* Header */}
      <div className="mb-6 border-b-2 border-gray-300 pb-4 text-center dark:border-gray-700">
        <h1 className="mb-1 text-3xl font-bold uppercase tracking-wider">
          {personalInfo.name || "Your Name"}
        </h1>
        <p className="mb-2 text-lg italic">
          {personalInfo.title || "Professional Title"}
        </p>

        <div className="flex flex-wrap justify-center gap-x-4 text-sm">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
        </div>
      </div>

      {/* Summary */}
      {personalInfo.summary && (
        <div className="mb-6">
          <h2 className="mb-2 text-xl font-bold uppercase">
            Professional Summary
          </h2>
          <p className="text-sm">{personalInfo.summary}</p>
        </div>
      )}

      {/* Experience */}
      {experience && experience.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 text-xl font-bold uppercase">
            Professional Experience
          </h2>
          <div className="space-y-4">
            {experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex flex-wrap items-center justify-between">
                  <h3 className="font-bold">{exp.company}</h3>
                  <p className="text-sm italic">
                    {exp.startDate} - {exp.endDate}
                  </p>
                </div>
                <p className="mb-1 font-semibold italic">{exp.position}</p>
                <p className="text-sm">{exp.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {education && education.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 text-xl font-bold uppercase">Education</h2>
          <div className="space-y-4">
            {education.map((edu) => (
              <div key={edu.id}>
                <div className="flex flex-wrap items-center justify-between">
                  <h3 className="font-bold">{edu.institution}</h3>
                  <p className="text-sm italic">
                    {edu.startDate} - {edu.endDate}
                  </p>
                </div>
                <p className="text-sm">
                  {edu.degree}
                  {edu.field ? `, ${edu.field}` : ""}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {skills && skills.length > 0 && (
        <div>
          <h2 className="mb-3 text-xl font-bold uppercase">Skills</h2>
          <p className="text-sm">
            {skills.map((skill, index) => (
              <span key={skill.id}>
                {skill.name}
                {index < skills.length - 1 ? ", " : ""}
              </span>
            ))}
          </p>
        </div>
      )}
    </div>
  );
}
