import { useState } from "react";
import { sendInquiry } from "../services/propertyApi";

const fieldClass =
  "w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold";

const labelClass = "mb-1 block text-sm font-semibold text-ink";

function InquiryForm({ propertyId, propertyTitle }) {
  const startingForm = {
    name: "",
    email: "",
    phone: "",
    message: `Hi, I'm interested in ${propertyTitle}. Is it still available?`,
  };

  const [form, setForm] = useState(startingForm);
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    setError("");

    try {
      await sendInquiry(propertyId, form);
      setStatus("sent");
    } catch (err) {
      setError(err.message || "Could not send your message");
      setStatus("error");
    }
  };

  const handleReset = () => {
    setForm(startingForm);
    setStatus("idle");
  };

  if (status === "sent") {
    return (
      <div role="status">
        <h2 className="mb-1 text-lg font-semibold text-ink">Message sent</h2>
        <p className="mb-4 text-sm text-steel">
          The agent will reply to {form.email}.
        </p>
        <button
          type="button"
          onClick={handleReset}
          className="text-sm text-steel underline hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="mb-4 text-lg font-semibold text-ink">Contact the agent</h2>

      <div className="mb-3">
        <label htmlFor="name" className={labelClass}>
          Your name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          required
          minLength={2}
          maxLength={100}
          autoComplete="name"
          className={fieldClass}
        />
      </div>

      <div className="mb-3">
        <label htmlFor="email" className={labelClass}>
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
          maxLength={200}
          autoComplete="email"
          className={fieldClass}
        />
      </div>

      <div className="mb-3">
        <label htmlFor="phone" className={labelClass}>
          Phone (optional)
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          value={form.phone}
          onChange={handleChange}
          maxLength={30}
          autoComplete="tel"
          className={fieldClass}
        />
      </div>

      <div className="mb-4">
        <label htmlFor="message" className={labelClass}>
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          value={form.message}
          onChange={handleChange}
          required
          minLength={10}
          maxLength={2000}
          className={fieldClass}
        />
      </div>

      {status === "error" && (
        <p role="alert" className="mb-3 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full rounded-md bg-ink px-4 py-2.5 text-sm font-semibold text-white hover:bg-steel disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
      >
        {status === "sending" ? "Sending..." : "Send message"}
      </button>
    </form>
  );
}

export default InquiryForm;