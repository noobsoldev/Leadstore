
import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Globe, 
  Zap, 
  ShieldCheck, 
  ArrowRight, 
  Target, 
  User, 
  Mail, 
  Smartphone, 
  Send,
  X,
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import DottedWorldMap from './DottedWorldMap';

interface LandingPageProps {
  onStart: () => void;
}

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
      >
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>
        <div className="p-8 overflow-y-auto">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const [formState, setFormState] = useState({ name: '', email: '', mobile: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | 'contact' | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormState({ name: '', email: '', mobile: '' });
      setActiveModal(null);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans overflow-x-hidden">
      {/* Navigation */}
      <header>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Target size={22} />
            </div>
            <span className="text-xl font-bold tracking-tight">Leadstore.online</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#custom-solution" className="hover:text-blue-600 transition-colors">Custom Solutions</a>
            <button 
              onClick={() => setActiveModal('contact')}
              className="hover:text-blue-600 transition-colors"
            >
              Contact
            </button>
            <button 
              onClick={onStart}
              aria-label="Launch the free lead scraping tool"
              className="bg-blue-600 text-white px-5 py-2.5 rounded-full hover:bg-blue-700 transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              Launch Free Tool
            </button>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-6">
                  <ShieldCheck size={14} />
                  <span>100% Free For All Users</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 leading-[1.1] mb-6 tracking-tight">
                  The Ultimate <span className="text-blue-600">B2B Lead Scraper</span> for Local Growth.
                </h1>
                <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-xl">
                  Extract high-quality business leads directly from Google Maps using advanced AI. Get names, addresses, phones, and websites in seconds. <strong>Completely free to use.</strong>
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={onStart}
                    aria-label="Start scraping business leads now"
                    className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95 group"
                  >
                    Start Scraping Now
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                className="relative"
              >
                <DottedWorldMap />
                {/* Decorative elements */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-100 rounded-full blur-3xl opacity-60"></div>
                <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-emerald-100 rounded-full blur-3xl opacity-60"></div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* SEO Friendly Features Grid */}
        <section id="features" className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why use Leadstore.online for your Lead Generation?</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Our AI-powered scraper is designed for speed, accuracy, and ease of use. Build your business database without spending a dime.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Search className="text-blue-600" />,
                  title: "Local Lead Discovery",
                  desc: "Find businesses in any niche, optimized for local SEO discovery and outreach."
                },
                {
                  icon: <Globe className="text-emerald-600" />,
                  title: "Global Business Data",
                  desc: "Extract data from any city worldwide. Perfect for international sales teams."
                },
                {
                  icon: <Zap className="text-amber-600" />,
                  title: "Fast AI Extraction",
                  desc: "Powered by Gemini for high-accuracy data parsing. No more manual data entry."
                }
              ].map((feature, idx) => (
                <motion.div 
                  key={idx}
                  whileHover={{ y: -5 }}
                  className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Custom Solution CTA & Contact Form */}
        <section id="custom-solution" className="py-24 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gray-900 rounded-[3rem] p-8 md:p-16 text-white grid lg:grid-cols-2 gap-12 items-center relative z-10">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                  Need a Custom Solution for your Business?
                </h2>
                <p className="text-gray-400 text-lg mb-8">
                  If our free tool isn't enough for your enterprise needs, get a tailored data extraction engine built specifically for your workflow.
                </p>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <Zap size={12} className="text-white" />
                    </div>
                    <h3 className="text-base font-normal">Custom API Integrations</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <Zap size={12} className="text-white" />
                    </div>
                    <h3 className="text-base font-normal">Bulk Data Processing (Millions of records)</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <Zap size={12} className="text-white" />
                    </div>
                    <h3 className="text-base font-normal">Automated CRM Sync</h3>
                  </div>
                </div>
                <div className="pt-6 border-t border-gray-800">
                  <p className="text-sm text-gray-500 mb-2 uppercase tracking-widest font-bold">Developed By</p>
                  <h3 className="text-2xl font-bold">
                    Noob<span className="text-[#990000] font-bold">{'{'}</span>Dev<span className="text-[#990000] font-bold">{'}'}</span> Technologies
                  </h3>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-8 text-gray-900 shadow-2xl">
                <h3 className="text-2xl font-bold mb-6">Contact Us</h3>
                {isSubmitted ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShieldCheck size={32} />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">Message Sent!</h4>
                    <p className="text-gray-500">We'll get back to you shortly.</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                          id="name"
                          required
                          type="text" 
                          placeholder="John Doe"
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                          value={formState.name}
                          onChange={e => setFormState({...formState, name: e.target.value})}
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                          id="email"
                          required
                          type="email" 
                          placeholder="john@example.com"
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                          value={formState.email}
                          onChange={e => setFormState({...formState, email: e.target.value})}
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="mobile" className="block text-sm font-bold text-gray-700 mb-1">Mobile Number</label>
                      <div className="relative">
                        <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                          id="mobile"
                          required
                          type="tel" 
                          placeholder="+1 (555) 000-0000"
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                          value={formState.mobile}
                          onChange={e => setFormState({...formState, mobile: e.target.value})}
                        />
                      </div>
                    </div>
                    <button 
                      type="submit"
                      aria-label="Submit contact form for custom solution"
                      className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg active:scale-95 mt-4"
                    >
                      Submit Request
                      <Send size={18} />
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
          {/* Background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none"></div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <Target size={18} />
            </div>
            <span className="font-bold tracking-tight">Leadstore.online</span>
          </div>
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Leadstore.online. Developed by <a href="https://noobdev.tech/" target="_blank" rel="noopener noreferrer" className="hover:underline">Noob<span className="text-[#990000] font-bold">{'{'}</span>Dev<span className="text-[#990000] font-bold">{'}'}</span> Technologies</a>.
          </p>
          <div className="flex gap-6 text-sm text-gray-400">
            <button onClick={() => setActiveModal('privacy')} className="hover:text-gray-600">Privacy</button>
            <button onClick={() => setActiveModal('terms')} className="hover:text-gray-600">Terms</button>
            <button onClick={() => setActiveModal('contact')} className="hover:text-gray-600">Contact</button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AnimatePresence>
        {activeModal === 'privacy' && (
          <Modal isOpen={true} onClose={() => setActiveModal(null)} title="Privacy Policy">
            <div className="prose prose-sm max-w-none text-gray-600">
              <p className="mb-4">At Leadstore.online, we value your privacy. This policy explains how we handle data.</p>
              <h4 className="font-bold text-gray-900 mb-2">1. Data Collection</h4>
              <p className="mb-4">We do not store any business data you scrape. All extraction happens in real-time and results are handled locally in your browser.</p>
              <h4 className="font-bold text-gray-900 mb-2">2. Usage</h4>
              <p className="mb-4">The tool is intended for finding publicly available business information. Users are responsible for complying with local regulations regarding outreach.</p>
              <h4 className="font-bold text-gray-900 mb-2">3. Cookies</h4>
              <p className="mb-4">We use minimal cookies for essential site functionality and analytics to improve our service.</p>
            </div>
          </Modal>
        )}

        {activeModal === 'terms' && (
          <Modal isOpen={true} onClose={() => setActiveModal(null)} title="Terms of Service">
            <div className="prose prose-sm max-w-none text-gray-600">
              <p className="mb-4">By using Leadstore.online, you agree to the following terms:</p>
              <h4 className="font-bold text-gray-900 mb-2">1. Acceptable Use</h4>
              <p className="mb-4">You agree not to use this tool for any illegal activities or to violate the terms of service of third-party data providers.</p>
              <h4 className="font-bold text-gray-900 mb-2">2. No Warranty</h4>
              <p className="mb-4">The tool is provided "as is" without any warranties. We are not responsible for the accuracy of the data extracted.</p>
              <h4 className="font-bold text-gray-900 mb-2">3. Limitation of Liability</h4>
              <p className="mb-4">Leadstore.online and Noob{'{'}Dev{'}'} Technologies shall not be liable for any damages arising from the use of this tool.</p>
            </div>
          </Modal>
        )}

        {activeModal === 'contact' && (
          <Modal isOpen={true} onClose={() => setActiveModal(null)} title="Contact Us">
            <div className="bg-white rounded-3xl p-2 text-gray-900">
              <p className="text-gray-600 mb-6">Have questions or need a custom solution? Send us a message and our team will get back to you.</p>
              {isSubmitted ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck size={32} />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Message Sent!</h4>
                  <p className="text-gray-500">We'll get back to you shortly.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="modal-name" className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        id="modal-name"
                        required
                        type="text" 
                        placeholder="John Doe"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                        value={formState.name}
                        onChange={e => setFormState({...formState, name: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="modal-email" className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        id="modal-email"
                        required
                        type="email" 
                        placeholder="john@example.com"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                        value={formState.email}
                        onChange={e => setFormState({...formState, email: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="modal-mobile" className="block text-sm font-bold text-gray-700 mb-1">Mobile Number</label>
                    <div className="relative">
                      <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        id="modal-mobile"
                        required
                        type="tel" 
                        placeholder="+1 (555) 000-0000"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                        value={formState.mobile}
                        onChange={e => setFormState({...formState, mobile: e.target.value})}
                      />
                    </div>
                  </div>
                  <button 
                    type="submit"
                    aria-label="Submit contact form"
                    className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg active:scale-95 mt-4"
                  >
                    Send Message
                    <Send size={18} />
                  </button>
                </form>
              )}
              <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                <p className="text-xs text-gray-400 mb-2 uppercase tracking-widest font-bold">Powered By</p>
                <a href="https://noobdev.tech/" target="_blank" rel="noopener noreferrer" className="text-lg font-bold hover:underline">
                  Noob<span className="text-[#990000] font-bold">{'{'}</span>Dev<span className="text-[#990000] font-bold">{'}'}</span> Technologies
                </a>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LandingPage;
