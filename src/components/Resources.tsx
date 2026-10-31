import { useState } from "react";
import { ExternalLink, Search } from "lucide-react";

// Kept from the original project and extended with interview-focused links.
const resources = [
  {
    name: "Data Structures & Algorithms",
    description: "Structured DSA sheets and problem solving for coding rounds.",
    url: "https://takeuforward.org/",
    category: "Coding",
  },
  {
    name: "C++ Programming",
    description: "Learn C++ fundamentals and object-oriented programming.",
    url: "https://www.learncpp.com/",
    category: "Coding",
  },
  {
    name: "Python Tutorial",
    description: "Official Python documentation and tutorials.",
    url: "https://docs.python.org/3/tutorial/",
    category: "Coding",
  },
  {
    name: "SQL Course",
    description: "Free SQL course with lessons and exercises - a common interview topic.",
    url: "https://cs50.harvard.edu/sql/",
    category: "Database",
  },
  {
    name: "Git and GitHub",
    description: "Learn version control with the Pro Git book.",
    url: "https://git-scm.com/book/en/v2",
    category: "Development",
  },
  {
    name: "Web Development",
    description: "Learn HTML, CSS, JavaScript and web development on MDN.",
    url: "https://developer.mozilla.org/en-US/docs/Learn_web_development",
    category: "Development",
  },
  {
    name: "System Design Primer",
    description: "Learn how to design large-scale systems for design rounds.",
    url: "https://github.com/donnemartin/system-design-primer",
    category: "System design",
  },
  {
    name: "STAR Method for Behavioral Answers",
    description: "Structure behavioral answers: Situation, Task, Action, Result.",
    url: "https://www.themuse.com/advice/star-interview-method",
    category: "Behavioral",
  },
  {
    name: "AI and Machine Learning",
    description: "Explore beginner-friendly AI and ML courses.",
    url: "https://www.freecodecamp.org/learn/",
    category: "AI / ML",
  },
  {
    name: "Digital Marketing",
    description: "Learn digital marketing through Google's training.",
    url: "https://skillshop.withgoogle.com/",
    category: "Career",
  },
];

export default function Resources() {
  const [search, setSearch] = useState("");
  const query = search.trim().toLowerCase();
  const filtered = resources.filter((r) =>
    `${r.name} ${r.category} ${r.description}`.toLowerCase().includes(query),
  );

  return (
    <>
      <div className="page-heading">
        <div className="eyebrow">LEARN SOMETHING EVERY DAY</div>
        <h1>Interview prep resources</h1>
        <p className="muted">Curated links to strengthen the topics interviewers ask about most.</p>
      </div>

      <div className="search-box">
        <Search size={18} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search topics, skills or categories..."
          aria-label="Search resources"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="panel empty-state">No resources match "{search}".</div>
      ) : (
        <div className="resource-grid">
          {filtered.map((r) => (
            <a className="resource-card" href={r.url} target="_blank" rel="noreferrer" key={r.name}>
              <div className="resource-top">
                <span className="resource-category">{r.category}</span>
                <ExternalLink size={17} />
              </div>
              <h3>{r.name}</h3>
              <p>{r.description}</p>
              <div className="resource-link">
                Open resource <ExternalLink size={14} />
              </div>
            </a>
          ))}
        </div>
      )}
    </>
  );
}
