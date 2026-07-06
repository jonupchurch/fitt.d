import { Document, HeadingLevel, Packer, Paragraph, TextRun } from "docx";
import type { WorkingResumeCopy } from "@/lib/resume/working-copy";

/**
 * Builds a properly formatted .docx of the candidate's current working
 * resume copy (including any applied tailored edits), entirely
 * client-side — no network request, no new Server Action. See
 * specs/005-comparison-export/contracts/actions.md and
 * docs/adr/0007-report-export-approach.md.
 */
export async function buildTailoredResumeDocx(
  workingCopy: WorkingResumeCopy,
): Promise<Blob> {
  const { sections } = workingCopy;
  const children: Paragraph[] = [];

  children.push(
    new Paragraph({
      text: sections.contact.name ?? "Resume",
      heading: HeadingLevel.TITLE,
    }),
  );

  const contactLine = [
    sections.contact.email,
    sections.contact.phone,
    sections.contact.location,
  ]
    .filter((value): value is string => Boolean(value))
    .join(" · ");
  if (contactLine) {
    children.push(new Paragraph({ children: [new TextRun(contactLine)] }));
  }

  if (sections.summary) {
    children.push(
      new Paragraph({ text: "Summary", heading: HeadingLevel.HEADING_1 }),
    );
    children.push(new Paragraph({ children: [new TextRun(sections.summary)] }));
  }

  if (sections.experience.length > 0) {
    children.push(
      new Paragraph({ text: "Experience", heading: HeadingLevel.HEADING_1 }),
    );
    for (const entry of sections.experience) {
      const roleLine = [entry.role, entry.company]
        .filter((value): value is string => Boolean(value))
        .join(" — ");
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [new TextRun({ text: roleLine, bold: true })],
        }),
      );
      if (entry.dates) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: entry.dates, italics: true })],
          }),
        );
      }
      for (const bullet of entry.bullets) {
        children.push(new Paragraph({ text: bullet, bullet: { level: 0 } }));
      }
    }
  }

  if (sections.skills.length > 0) {
    children.push(
      new Paragraph({ text: "Skills", heading: HeadingLevel.HEADING_1 }),
    );
    children.push(
      new Paragraph({ children: [new TextRun(sections.skills.join(", "))] }),
    );
  }

  if (sections.education.length > 0) {
    children.push(
      new Paragraph({ text: "Education", heading: HeadingLevel.HEADING_1 }),
    );
    for (const entry of sections.education) {
      const line = [entry.institution, entry.credential, entry.dates]
        .filter((value): value is string => Boolean(value))
        .join(" — ");
      children.push(new Paragraph({ children: [new TextRun(line)] }));
    }
  }

  const doc = new Document({ sections: [{ children }] });
  return Packer.toBlob(doc);
}
