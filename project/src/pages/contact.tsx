import { Mail, MapPin, Phone } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../components/ui/button';

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate form submission
    console.log('Form submitted:', formData);
    // Reset form
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: '',
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold dark:text-white">Contact Us</h1>
        <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-400">
          Have questions about RentEase? We're here to help. Send us a message and we'll get back to
          you as soon as possible.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Contact Information */}
        <div className="lg:col-span-1">
          <div className="space-y-8 rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
            <div>
              <h3 className="mb-4 text-xl font-semibold dark:text-white">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <MapPin className="mr-3 h-6 w-6 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="font-medium dark:text-white">Office Location</p>
                    <p className="text-gray-600 dark:text-gray-400">123 Business Street</p>
                    <p className="text-gray-600 dark:text-gray-400">San Francisco, CA 94103</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Phone className="mr-3 h-6 w-6 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="font-medium dark:text-white">Phone Number</p>
                    <p className="text-gray-600 dark:text-gray-400">+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Mail className="mr-3 h-6 w-6 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="font-medium dark:text-white">Email Address</p>
                    <p className="text-gray-600 dark:text-gray-400">support@rentease.com</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-6 dark:border-gray-700">
              <h3 className="mb-4 text-xl font-semibold dark:text-white">Business Hours</h3>
              <div className="space-y-2 text-gray-600 dark:text-gray-400">
                <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                <p>Saturday: 10:00 AM - 4:00 PM</p>
                <p>Sunday: Closed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <div className="rounded-lg bg-white p-8 shadow-sm dark:bg-gray-800">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm 
                             focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200
                             dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400
                             dark:focus:border-blue-500 dark:focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm 
                             focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200
                             dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400
                             dark:focus:border-blue-500 dark:focus:ring-blue-400"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Subject
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm 
                           focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200
                           dark:border-gray-600 dark:bg-gray-700 dark:text-white
                           dark:focus:border-blue-500 dark:focus:ring-blue-400"
                >
                  <option value="">Select a subject</option>
                  <option value="general">General Inquiry</option>
                  <option value="support">Technical Support</option>
                  <option value="billing">Billing Question</option>
                  <option value="partnership">Partnership Opportunity</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm 
                           focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200
                           dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400
                           dark:focus:border-blue-500 dark:focus:ring-blue-400"
                ></textarea>
              </div>

              <Button type="submit" className="w-full">
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}