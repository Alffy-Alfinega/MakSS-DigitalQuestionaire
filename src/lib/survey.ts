export type RoleOption =
  | "Teaching staff"
  | "Administration (office, bursary, registry)"
  | "Support staff (lab, library, kitchen, security, grounds, etc.)"
  | "School leadership";

export type SurveyAnswers = {
  q1?: string;
  q2?: string;
  q3?: string;
  q4?: string[];
  q5?: string;
  q6?: Record<string, string>;
  q7?: string;
  q8?: string[];
  q8Other?: string;
  q9?: string[];
  q10?: string;
  q11?: string[];
  q12?: string;
  q13?: string[];
  q13Other?: string;
  q14?: Record<string, string>;
  q15?: Record<string, string>;
  q16?: string[];
  q16Other?: string;
  q17?: string;
  q18?: string;
  q19?: string[];
  q19Other?: string;
  q20?: string[];
  q21?: string[];
  q22?: string;
  q23?: string;
  q24?: string;
  q25?: string;
};

export type SurveyResponse = {
  id: string;
  submittedAt: string;
  answers: SurveyAnswers;
};

export const SKILL_ITEMS = [
  { key: "a", label: "Type and format a document (for example in Word)" },
  { key: "b", label: "Use a spreadsheet for marks or lists (for example in Excel)" },
  { key: "c", label: "Send, read and reply to email" },
  { key: "d", label: "Search the internet and judge whether information is reliable" },
  { key: "e", label: "Connect a laptop to a projector and use it in a lesson" },
  { key: "f", label: "Make a presentation" },
  { key: "g", label: "Find and use educational videos or websites" },
  { key: "h", label: "Use WhatsApp or similar for communication to fellow staff, students or parents" },
  { key: "i", label: "Save, organise and back up my files" },
  { key: "j", label: "Use an AI tool (such as ChatGPT) for lesson planning or questions" },
  { key: "k", label: "Print, copy and scan" },
  { key: "l", label: "Keep my passwords and accounts safe" },
] as const;

export const FACILITY_ITEMS = [
  { key: "a", label: "School internet" },
  { key: "b", label: "Electricity during working hours" },
  { key: "c", label: "Computers in the staffroom or office" },
  { key: "d", label: "The computer lab (when I need it)" },
  { key: "e", label: "Projectors" },
  { key: "f", label: "Printing and copying" },
  { key: "g", label: "Help when something breaks" },
] as const;

export const VIEW_ITEMS = [
  { key: "a", label: "Technology can save me time in my work" },
  { key: "b", label: "I am worried about changes in how we work" },
  { key: "c", label: "I would prefer to keep school records on paper" },
  { key: "d", label: "The school should use computers and projectors more" },
  { key: "e", label: "I would use AI tools if I had training and clear rules" },
  { key: "f", label: "I know where to report a computer or projector fault" },
  { key: "g", label: "I feel information about students is kept safe at this school" },
  { key: "h", label: "I feel supported when I try something new with technology" },
] as const;
