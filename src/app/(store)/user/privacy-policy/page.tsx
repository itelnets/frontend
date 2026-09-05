import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy | Pratham Herbs',
    description: 'Comprehensive Privacy Policy detailing how Pratham Herbs collects, protects, uses, and shares your personal data.',
};

export default function PrivacyPolicy() {
    return (
        <div className="w-full h-[calc(100dvh-110px)] sm:h-[calc(100dvh-150px)] md:h-[calc(100dvh-210px)] flex flex-col font-sans">
            <div className="bg-white rounded-none sm:rounded-lg shadow-sm border border-[#458500]/20 flex flex-col flex-1 min-h-0 overflow-hidden">
                <div className="p-3 sm:p-5 border-b-2 border-[#458500]/20 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-[#458500]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <h1 className="text-[16px] sm:text-[18px] font-bold text-gray-800 m-0">Pratham Herbs - Privacy Policy</h1>
                    </div>
                </div>
                <div className="px-4 sm:px-6 lg:px-8 py-4 flex-1 min-h-0 overflow-y-auto">
                    <div className="prose !text-[14px] sm:!text-[15px] text-gray-700 max-w-none space-y-3 sm:space-y-4">

                        <h2 className="text-[16px] sm:text-lg lg:text-xl font-bold text-gray-900 !mb-1 sm:!mb-2">1. Purpose &amp; Overview</h2>
                        <p>
                            Welcome to Pratham Herbs (“Pratham Herbs”, “we”, “our”, or “us”). We respect your privacy and are strongly committed to protecting the personal information you entrust to us. This Privacy Policy sets forth our practices regarding the collection, use, maintenance, storage, protection, and disclosure of information gathered when you visit our website, mobile interface, or purchase products through our e-commerce platform (collectively, the “Site”).
                        </p>
                        <p>
                            Please review this Privacy Policy thoroughly. By accessing, browsing, or placing an order on our Site, you confirm that you have read, understood, and agreed to the practices described in this document as well as our Terms and Conditions. If you do not agree with any part of this Privacy Policy, please discontinue your access and use of the Site immediately.
                        </p>

                        <h2 className="text-[16px] sm:text-lg lg:text-xl font-bold text-gray-900 mt-5 sm:mt-6 !mb-1 sm:!mb-2">2. Information We Collect</h2>
                        <p>
                            We collect several types of information from and about users of our Site to deliver an efficient, personalized, and secure shopping experience. This includes:
                        </p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>
                                <strong>Personal Identification Information:</strong> Full name, email address, mobile phone number, and password credentials provided when establishing an account or placing an order.
                            </li>
                            <li>
                                <strong>Shipping &amp; Billing Data:</strong> Recipient name, street address, city, state, postal code, landmark, and delivery phone numbers required for order fulfillment.
                            </li>
                            <li>
                                <strong>Transaction &amp; Payment Logs:</strong> Order details, purchase amounts, item lists, transaction references, and payment confirmation status. Payment processing is handled by certified payment gateways (e.g. Cashfree). We do not store sensitive credit card numbers, CVV codes, or UPI PINs on our servers.
                            </li>
                            <li>
                                <strong>Device &amp; Technical Identifiers:</strong> IP address, browser type, operating system, device models, referring URLs, time stamps, and interaction data collected automatically during browsing.
                            </li>
                        </ul>

                        <h2 className="text-[16px] sm:text-lg lg:text-xl font-bold text-gray-900 mt-5 sm:mt-6 !mb-1 sm:!mb-2">3. How We Use Your Information</h2>
                        <p>
                            We use the information collected for legitimate commercial and operational purposes designed to serve you effectively:
                        </p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Fulfilling, processing, and shipping your product orders accurately.</li>
                            <li>Sending automated transaction updates, digital invoices, order tracking details, and customer support notifications.</li>
                            <li>Managing your personal account, saved shipping addresses, custom lists, and past purchase history.</li>
                            <li>Detecting, preventing, and mitigating fraudulent transactions, chargebacks, or unauthorized access.</li>
                            <li>Optimizing Site performance, user interface layout, catalog search efficiency, and server responsiveness.</li>
                            <li>Delivering relevant promotional updates, new product notifications, or special offers (where explicitly opted-in).</li>
                        </ul>

                        <h2 className="text-[16px] sm:text-lg lg:text-xl font-bold text-gray-900 mt-5 sm:mt-6 !mb-1 sm:!mb-2">4. Information Sharing &amp; Disclosure</h2>
                        <p>
                            We do not sell, rent, trade, or monetize your personal information to third-party advertisers. We disclose collected information only under strict confidentiality and operational safeguards to the following recipients:
                        </p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>
                                <strong>Logistics &amp; Delivery Carriers:</strong> Courier services and fulfillment partners who require your shipping address and contact phone number to physically deliver packages to your doorstep.
                            </li>
                            <li>
                                <strong>Financial Processors:</strong> Payment gateway providers (such as Cashfree) necessary to verify, authorize, and process payment transactions safely.
                            </li>
                            <li>
                                <strong>Legal &amp; Regulatory Authorities:</strong> Government agencies or law enforcement officials when required by law, subpoena, court order, or to defend the legal rights, safety, and property of Pratham Herbs and its users.
                            </li>
                        </ul>

                        <h2 className="text-[16px] sm:text-lg lg:text-xl font-bold text-gray-900 mt-5 sm:mt-6 !mb-1 sm:!mb-2">5. Data Security &amp; Retention</h2>
                        <p>
                            We employ robust technical, organizational, and physical security measures to safeguard your personal data against unauthorized access, accidental loss, alteration, or disclosure:
                        </p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>
                                <strong>Encryption Standards:</strong> All data transmissions between your browser and our servers are encrypted using modern Transport Layer Security (TLS/SSL) technology.
                            </li>
                            <li>
                                <strong>Secure Storage:</strong> Account passwords are store utilizing one-way cryptographic hashing algorithms. Databases are hosted within secure, firewall-protected server environments.
                            </li>
                            <li>
                                <strong>Retention Policies:</strong> We retain your personal data for as long as your account remains active or as needed to provide services, comply with accounting and tax regulations, resolve disputes, and enforce legal agreements.
                            </li>
                        </ul>

                        <h2 className="text-[16px] sm:text-lg lg:text-xl font-bold text-gray-900 mt-5 sm:mt-6 !mb-1 sm:!mb-2">6. Cookies &amp; Tracking Technologies</h2>
                        <p>
                            Our Site utilizes cookies, local storage objects, and similar tracking technologies to enhance navigation, analyze site traffic, and deliver a personalized browsing experience:
                        </p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>
                                <strong>Essential Cookies:</strong> Required for fundamental site functions, such as maintaining active shopping cart contents, authenticating user sessions, and routing requests.
                            </li>
                            <li>
                                <strong>Performance &amp; Analytics Cookies:</strong> Assist us in understanding how visitors navigate the catalog, identifying slow loading pages, and measuring feature usage.
                            </li>
                            <li>
                                <strong>Cookie Management:</strong> You can choose to accept or decline cookies by modifying your internet browser settings. However, disabling essential cookies may impact certain interactive features of the Site.
                            </li>
                        </ul>

                        <h2 className="text-[16px] sm:text-lg lg:text-xl font-bold text-gray-900 mt-5 sm:mt-6 !mb-1 sm:!mb-2">7. Your Rights &amp; Choices</h2>
                        <p>
                            We empower you with complete control over your personal data:
                        </p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>
                                <strong>Access &amp; Updating:</strong> You may view, review, or modify your profile information, password, and saved delivery addresses anytime by accessing your account under <strong>My Account</strong>.
                            </li>
                            <li>
                                <strong>Communication Preferences:</strong> You can opt-out of promotional marketing communications at any time while continuing to receive essential transactional order updates.
                            </li>
                            <li>
                                <strong>Account Closure &amp; Erasure:</strong> You may request the deletion of your account and personal data by reaching out to our support team, subject to mandatory legal data retention requirements.
                            </li>
                        </ul>

                        <h2 className="text-[16px] sm:text-lg lg:text-xl font-bold text-gray-900 mt-5 sm:mt-6 !mb-1 sm:!mb-2">8. Children's Privacy &amp; Policy Updates</h2>
                        <p>
                            Our Site is intended solely for adult users who are at least eighteen (18) years of age. We do not knowingly collect or solicit personal information from individuals under the age of 18.
                        </p>
                        <p>
                            We reserve the right to modify or update this Privacy Policy periodically to reflect changes in legal requirements, security standards, or site features. Any updates will be published directly on this page with a revised effective date. Your continued use of the Site following updates constitutes your consent to the modified terms.
                        </p>

                        <h2 className="text-[16px] sm:text-lg lg:text-xl font-bold text-gray-900 mt-5 sm:mt-6 !mb-1 sm:!mb-2">9. Contact Us</h2>
                        <p className="mb-2 text-sm sm:text-base">
                            If you have questions, inquiries, or concerns regarding this Privacy Policy, your personal data, or data protection practices, please contact us:
                        </p>
                        <p className="text-sm sm:text-base">
                            <span className="font-semibold text-gray-900 mr-2">Email Support:</span>
                            <a href="mailto:care@prathamherbs.com" className="text-[#458500] hover:text-[#366800] hover:underline font-bold break-all">
                                care@prathamherbs.com
                            </a>
                        </p>
                        <p className="text-sm sm:text-base mt-1">
                            <span className="font-semibold text-gray-900 mr-2">Store Address:</span>
                            <span className="text-gray-700 font-medium">121, Varni Plaza, Mota Varachha, Surat, Gujarat, India - 394101</span>
                        </p>

                    </div>
                </div>
            </div>
        </div>
    );
}
