import { Resend } from "resend";
const apikey = process.env.RESEND_API_KEY || "";
const resend = new Resend(apikey);

export async function sendEmail(to: string, subject: string, html: string) {
    console.log(" Sending email to:", to);
    try {
        const { data, error } = await resend.emails.send({
            from: "Acme <onboarding@resend.dev>",
            to,
            subject,
            html,
        });
        console.log("Email sent:", data);
        return data;
    } catch (error) {
        console.log(error)
        return error;
    }
}