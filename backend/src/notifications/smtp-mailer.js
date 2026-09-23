import nodemailer from "nodemailer";

export function createSmtpMailer(config) {
  if (!config?.host || !config?.port || !config?.from) {
    throw new Error("SMTP email configuration is required");
  }

  const transport = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.auth ? {
      user: config.auth.user,
      pass: config.auth.password
    } : undefined,
    disableFileAccess: true,
    disableUrlAccess: true
  });

  return {
    async sendMail(message) {
      return transport.sendMail({
        from: config.from,
        ...message,
        disableFileAccess: true,
        disableUrlAccess: true
      });
    },
    async verify() {
      return transport.verify();
    },
    close() {
      if (typeof transport.close === "function") transport.close();
    }
  };
}
