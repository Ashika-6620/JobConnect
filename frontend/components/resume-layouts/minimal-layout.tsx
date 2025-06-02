export function MinimalLayout({ data }) {
  const { personalInfo, experience, education, skills } = data;

  return (
    <div className="font-sans">
      {/* Header */}
      <div className="mb-6">
        <h1 className="mb-1 text-2xl font-bold">
          {personalInfo.name || "Your Name"}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {personalInfo.title || "Professional Title"}
        </p>

        <div className="mt-2 flex flex-wrap gap-x-4 text-xs text-gray-600 dark:text-gray-400">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
        </div>
      </div>

      {/* Summary */}
      {personalInfo.summary && (
        <div className="mb-4">
          <p className="text-sm">{personalInfo.summary}</p>
        </div>
      )}

      {/* Experience */}
      {experience && experience.length > 0 && (
        <div className="mb-4">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Experience
          </h2>
          <div className="space-y-3">
            {experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex flex-wrap items-baseline justify-between">
                  <h3 className="font-medium">{exp.position}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {exp.startDate} - {exp.endDate}
                  </p>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {exp.company}
                </p>
                <p className="mt-1 text-xs">{exp.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {education && education.length > 0 && (
        <div className="mb-4">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Education
          </h2>
          <div className="space-y-3">
            {education.map((edu) => (
              <div key={edu.id}>
                <div className="flex flex-wrap items-baseline justify-between">
                  <h3 className="font-medium">{edu.degree}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {edu.startDate} - {edu.endDate}
                  </p>
                </div>
                <p className="text-xs">
                  {edu.institution}
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
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Skills
          </h2>
          <div className="flex flex-wrap gap-1">
            {skills.map((skill) => (
              <span
                key={skill.id}
                className="rounded-sm bg-gray-100 px-2 py-0.5 text-xs dark:bg-gray-800"
              >
                {skill.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
