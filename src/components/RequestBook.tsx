import { useState } from "react";
import emailjs from "emailjs-com";
import toast, { Toaster } from "react-hot-toast";

export default function RequestBook() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bookTitle: "",
    reason: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const sendEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.bookTitle || !formData.reason) {
      toast.error("All fields are required!");
      return;
    }

    setLoading(true);

    try {
      await emailjs.send(
        "service_qmwg7xh", // Replace with EmailJS service ID
        "template_5t1xyeq", // Replace with EmailJS template ID
        formData,
        "Y9ubFsCG99KwxStpA" // Replace with EmailJS public key
      );

      toast.success("📚 Request Sent! We'll get back to you soon.");
      setFormData({ name: "", email: "", bookTitle: "", reason: "" }); // Clear form
    } catch (error) {
      toast.error("❌ Failed to send request. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-6">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="bg-white dark:bg-gray-700 shadow-lg rounded-lg p-8 max-w-lg w-full">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 text-center mb-4">📖 Request a New Book</h2>
        <p className="text-gray-600 dark:text-gray-100 text-center mb-6">Fill in the details and we’ll consider adding it.</p>

        <form onSubmit={sendEmail} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="email"
            name="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="text"
            name="bookTitle"
            placeholder="Book Title"
            value={formData.bookTitle}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <textarea
            name="reason"
            placeholder="Why do you need this book?"
            value={formData.reason}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white  py-2 rounded hover:bg-blue-600 transition duration-200"
            disabled={loading}
          >
            {loading ? "Sending..." : "Request Book"}
          </button>
        </form>
      </div>
    </div>
  );
}
