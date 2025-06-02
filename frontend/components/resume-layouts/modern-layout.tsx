export function ModernLayout({ data }) {
  const { personalInfo, experience, education, skills } = data;

  return (
    <div className="font-sans">
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="mb-1 text-3xl font-bold">
          {personalInfo.name || "Your Name"}
        </h1>
        <p className="mb-2 text-lg text-gray-600 dark:text-gray-400">
          {personalInfo.title || "Professional Title"}
        </p>

        <div className="flex flex-wrap justify-center gap-x-4 text-sm text-gray-600 dark:text-gray-400">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
        </div>
      </div>

      {/* Summary */}
      {personalInfo.summary && (
        <div className="mb-6">
          <h2 className="mb-2 border-b pb-1 text-lg font-semibold">Summary</h2>
          <p className="text-sm">{personalInfo.summary}</p>
        </div>
      )}

      {/* Experience */}
      {experience && experience.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-2 border-b pb-1 text-lg font-semibold">
            Experience
          </h2>
          <div className="space-y-4">
            {experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex flex-wrap items-center justify-between">
                  <h3 className="font-medium">{exp.position}</h3>
                  <p className="text-sm text-gray-600">
                    {exp.startDate} - {exp.endDate}
                  </p>
                </div>
                <p className="text-sm text-gray-600">{exp.company}</p>
                <p className="mt-1 text-sm">{exp.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {education && education.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-2 border-b pb-1 text-lg font-semibold">
            Education
          </h2>
          <div className="space-y-4">
            {education.map((edu) => (
              <div key={edu.id}>
                <div className="flex flex-wrap items-center justify-between">
                  <h3 className="font-medium">{edu.institution}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
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
          <h2 className="mb-2 border-b pb-1 text-lg font-semibold">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill.id}
                className="rounded-full text-white px-3 py-1 text-sm bg-gray-800"
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
