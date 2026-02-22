import { ActionError, defineAction } from "astro:actions";
import { Resend } from "resend";
import { z } from "zod";

const sensorySchema = z.object({
  quiet: z.boolean(),
  clipperWarning: z.boolean(),
  noMusic: z.boolean(),
  noWash: z.boolean(),
  lightTouch: z.boolean(),
  breaks: z.boolean(),
  styleMenu: z.boolean(),
  mirrorOptional: z.boolean(),
  lowScent: z.boolean(),
  digitalOnly: z.boolean(),
  stepByStep: z.boolean(),
  companion: z.boolean(),
});

const bookingInputSchema = z.object({
  name: z.string().min(3),
  contactMethod: z.enum(["Email", "Text", "Phone"]),
  contactDetail: z.string().min(1),
  address: z.string(),
  service: z.string(),
  preferredTime: z.string(),
  notes: z.string(),
  otherPreferences: z.string(),
  sensory: sensorySchema,
});

function buildBookingEmailHtml(
  input: z.infer<typeof bookingInputSchema>
): string {
  const sensoryList = Object.entries(input.sensory)
    .filter(([, v]) => v)
    .map(([k]) => k)
    .join(", ");
  return `
    <h2>New booking request from ${escapeHtml(input.name)}</h2>
    <p><strong>Contact:</strong> ${escapeHtml(input.contactMethod)} — ${escapeHtml(input.contactDetail)}</p>
    <p><strong>Address:</strong> ${escapeHtml(input.address) || "—"}</p>
    <p><strong>Service:</strong> ${escapeHtml(input.service)}</p>
    <p><strong>Preferred time:</strong> ${escapeHtml(input.preferredTime) || "—"}</p>
    <p><strong>Notes:</strong> ${escapeHtml(input.notes) || "—"}</p>
    <p><strong>Other preferences:</strong> ${escapeHtml(input.otherPreferences) || "—"}</p>
    <p><strong>Sensory preferences:</strong> ${sensoryList ? escapeHtml(sensoryList) : "None"}</p>
  `.trim();
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export const server = {
  send: defineAction({
    accept: "json",
    input: bookingInputSchema,
    handler: async (input) => {
      const apiKey = import.meta.env.RESEND_API_KEY;
      const to =
        import.meta.env.DEV_BOOKING_EMAIL ?? import.meta.env.LUCY_BOOKING_EMAIL;
      const from =
        import.meta.env.EMAIL_FROM_ADDRESS ??
        "Lucy Russell Hair <onboarding@resend.dev>";

      if (!apiKey || typeof apiKey !== "string") {
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Email is not configured",
        });
      }
      if (!to || typeof to !== "string") {
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Booking recipient email is not configured",
        });
      }

      const resend = new Resend(apiKey);
      const html = buildBookingEmailHtml(input);

      const { data, error } = await resend.emails.send({
        from,
        to: [to],
        subject: `New booking request from ${input.name}`,
        html,
      });

      if (error) {
        throw new ActionError({
          code: "BAD_REQUEST",
          message: error.message,
        });
      }

      return data;
    },
  }),
};
