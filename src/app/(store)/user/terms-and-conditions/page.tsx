import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Terms and Conditions | Pratham Herbs',
    description: 'Terms and conditions for using Pratham Herbs platform and services.',
};

export default function TermsAndConditions() {
    return (
        <div className="w-full h-[calc(100dvh-110px)] sm:h-[calc(100dvh-150px)] md:h-[calc(100dvh-210px)] flex flex-col font-sans">
            <div className="bg-white rounded-none sm:rounded-lg shadow-sm border border-[#458500]/20 flex flex-col flex-1 min-h-0 overflow-hidden">
                <div className="p-3 sm:p-5 border-b-2 border-[#458500]/20 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-[#458500]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h1 className="text-[16px] sm:text-[18px] font-bold text-gray-800 m-0">Pratham Herbs - Terms & Conditions</h1>
                    </div>
                </div>
                <div className="px-4 sm:px-6 lg:px-8 py-4 flex-1 min-h-0 overflow-y-auto">
                    <div className="prose !text-[14px] sm:!text-[15px] text-gray-700 max-w-none space-y-3 sm:space-y-4">

                        <h2 className="text-[16px] sm:text-lg lg:text-xl font-bold text-gray-900 !mb-1 sm:!mb-2">1. Purpose</h2>
                        <p>
                            Welcome to the Pratham Herbs family of websites, mobile websites, and mobile apps (collectively, the “Site”). This Pratham Herbs Terms of Use Agreement ("Agreement") sets forth the agreement between Pratham Herbs (“Pratham Herbs”, “we”, or “us”), and each user ("user", "your" or "you"). This Agreement governs your use of the Site and the Pratham Herbs Privacy Policy (“Privacy Policy”). Please read this Agreement carefully and fully before using the Site or disclosing to us any personal information.
                        </p>
                        <p>
                            By using the Site or disclosing to us any personal information: (i) you agree that you have read and understood the terms of this Agreement, (ii) you accept and agree to be bound by the terms of this Agreement, and (iii) you accept and agree to abide by all laws and regulations applicable to the subject matter of this Agreement.
                        </p>
                        <p className="font-bold">
                            If you do not agree to the terms of this Agreement, do not access or otherwise use the Site or disclose to us any personal information.
                        </p>
                        <p>
                            The terms in this Agreement may change periodically and may be revised at any time and from time to time at our sole discretion by updating this posting. You should visit this page from time to time to review the then current terms of use because they are binding on you. Your continued use of the Site means that you accept any changes or modifications to this Agreement. If any modification is unacceptable to you, your only recourse is to terminate this Agreement by contacting Customer Service.
                        </p>

                        <h2 className="text-[16px] sm:text-lg lg:text-xl font-bold text-gray-900 mt-5 sm:mt-6 !mb-1 sm:!mb-2">2. Risk of Loss/Title Transfer</h2>
                        <p>
                            All purchases of products are made pursuant to the respective shipping agreements designated upon order placement. Title for any products purchased by you will transfer upon our delivery to the carrier.
                        </p>

                        <h2 className="text-[16px] sm:text-lg lg:text-xl font-bold text-gray-900 mt-5 sm:mt-6 !mb-1 sm:!mb-2">3. Code of Conduct</h2>
                        <p>
                            Pratham Herbs’ Code of Conduct is included in this Agreement. Customers, vendors, visitors to the Site, and stakeholders are expected to comply with the Code of Conduct.
                        </p>

                        <h2 className="text-[16px] sm:text-lg lg:text-xl font-bold text-gray-900 mt-5 sm:mt-6 !mb-1 sm:!mb-2">4. Product Disclaimer</h2>
                        <p>
                            Products, services, information and other content provided on the Site, including information that may be provided on the Site directly or by linking to third-party websites, are provided for informational purposes only. Links to or access from any third party websites or resources is not an endorsement of any information, product or service. We are not responsible for the content or performance of any third party websites. Use of any third party websites is at your own risk.
                        </p>
                        <p>
                            Always check the product label or packaging prior to using any product. If there are discrepancies, customers should follow the information provided on the product label or packaging. You should contact the manufacturer directly for clarification as to product labeling and packaging details and recommended use.
                        </p>

                        <h2 className="text-[16px] sm:text-lg lg:text-xl font-bold text-gray-900 mt-5 sm:mt-6 !mb-1 sm:!mb-2">5. Product Purchases</h2>
                        <p>
                            To the extent you make purchases on the Site, you agree that all purchases of products are made pursuant to the respective shipping contracts designated upon order placement. Title for any products purchased by you will transfer to you upon our delivery to the carrier.
                        </p>
                        <p>
                            It is your responsibility to ascertain and comply with all applicable local, state, federal, and international laws regarding the receipt, possession, use, and sale of any item purchased from this Site. When ordering from Pratham Herbs, you are responsible for assuring the product can be lawfully imported into your country. Customers are the importers of record and must comply with all laws and regulations of the destination country.
                        </p>
                        <p>
                            Pratham Herbs reserves the right to prohibit purchases of any merchandise to resellers. Resellers are defined as a company or an individual that purchases goods with the intention of selling them rather than using them.
                        </p>

                        <h2 className="text-[16px] sm:text-lg lg:text-xl font-bold text-gray-900 mt-5 sm:mt-6 !mb-1 sm:!mb-2">6. Usage & Termination</h2>
                        <p>
                            By using our Site, you represent and agree that you are at least eighteen (18) years of age or older and are fully able and competent to agree to the terms in this Agreement. If you are under the age of 18, you are not permitted to use this Site.
                        </p>

                        <h2 className="text-[16px] sm:text-lg lg:text-xl font-bold text-gray-900 mt-5 sm:mt-6 !mb-1 sm:!mb-2">7. Account Setup & Use</h2>
                        <p>
                            You may be required to establish an account on the Site in order to use certain features. When creating an account, you agree to provide accurate, true, complete and current information about yourself as prompted by the Site and to promptly update such information. If you provide any inaccurate, false, incomplete or outdated information or we in our sole discretion suspect that such information is inaccurate, false, incomplete or outdated, we reserve the right to suspend or terminate your account.
                        </p>
                        <p>
                            During the registration process you will create a username and password. You are responsible for the confidentiality of your account and password and are fully responsible for all activities that occur under your account. You agree to immediately notify us of any unauthorized use of your account or password. We are not liable for any loss or damage resulting from your failure to comply with this section.
                        </p>

                        <h2 className="text-[16px] sm:text-lg lg:text-xl font-bold text-gray-900 mt-5 sm:mt-6 !mb-1 sm:!mb-2">8. Use of the Site</h2>
                        <p>
                            You agree to use the Site for lawful purposes and that you are responsible for your use of and communications on the Site. You agree not to post on or transmit through the Site any unlawful, infringing, defamatory, obscene, indecent, threatening, offensive or otherwise objectionable material of any kind including any material that encourages illegal conduct or conduct that would encourage civil liability, infringe on other's intellectual property rights or otherwise violates any applicable local, state, national or international law.
                        </p>
                        <p>
                            You agree not to access the Site by any means other than the interface we provide. Displaying or running the Site or any information or material displayed on the Site in frames or through similar means on another website without our prior authorization is prohibited.
                        </p>

                        <h2 className="text-[16px] sm:text-lg lg:text-xl font-bold text-gray-900 mt-5 sm:mt-6 !mb-1 sm:!mb-2">9. Termination or Suspension of the Agreement</h2>
                        <p>
                            This Agreement is effective until terminated by either us or you. We, in our sole discretion, may suspend or terminate this Agreement at any time without notice and deny you access to the Site or any portion of it. You may terminate this Agreement at any time by contacting Customer Service and discontinuing all use of the Site.
                        </p>

                        <h2 className="text-[16px] sm:text-lg lg:text-xl font-bold text-gray-900 mt-5 sm:mt-6 !mb-1 sm:!mb-2">10. Account Termination</h2>
                        <p>
                            We reserve the right to terminate any account if your order is deemed fraudulent or credit card charges are disputed. You agree that we may terminate or suspend your access to all or part of the Site, with or without notice, for any conduct that we, in our sole discretion, believe is in violation of any part of this Agreement, laws or regulations or is harmful to another user or us or our affiliates.
                        </p>

                        <h2 className="text-[16px] sm:text-lg lg:text-xl font-bold text-gray-900 mt-5 sm:mt-6 !mb-1 sm:!mb-2">11. Pricing</h2>
                        <p>
                            With respect to items sold by Pratham Herbs, we cannot confirm the price of an item until you order. Despite our best efforts, a small number of the items in our catalog may be mispriced. Subject to applicable law, if the correct price of an item sold by Pratham Herbs is higher than our stated price, we will, at our discretion, either contact you for instructions before shipping or cancel your order and notify you of such cancellation.
                        </p>

                        <h2 className="text-[16px] sm:text-lg lg:text-xl font-bold text-gray-900 mt-5 sm:mt-6 !mb-1 sm:!mb-2">12. User Content and Conduct</h2>
                        <p>
                            User Generated Content Guidelines are included in this Agreement. All User Generated Content must comply with the guidelines which are a binding part of this Agreement. User Generated Content, including product reviews, solely reflect the views and opinions expressed by the contributor and not those of Pratham Herbs. Pratham Herbs does not verify or endorse any claims made in reviews.
                        </p>

                        <h2 className="text-[16px] sm:text-lg lg:text-xl font-bold text-gray-900 mt-5 sm:mt-6 !mb-1 sm:!mb-2">13. Privacy</h2>
                        <p>
                            By agreeing and adhering to the terms of this Agreement, you also confirm that you understand Pratham Herbs’s Privacy Policy. To learn more about what we do with your information please review the Privacy Policy.
                        </p>

                        <h2 className="text-[16px] sm:text-lg lg:text-xl font-bold text-gray-900 mt-5 sm:mt-6 !mb-1 sm:!mb-2">14. Consent to Communications</h2>
                        <p>
                            You consent to receive SMS messages (including text messages) and emails from us to the specific number(s) and email address you have provided to us with information or questions about your account and/or orders.
                        </p>
                        <p>
                            You may also have elected to receive marketing and promotional SMS messages (including text messages) from us. Your consent to receive marketing and promotional SMS messages is not required to purchase goods or services. Message and data rates may apply and message frequency may vary. Carriers are not liable for delayed or undelivered messages.
                        </p>

                        <h2 className="text-[16px] sm:text-lg lg:text-xl font-bold text-gray-900 mt-5 sm:mt-6 !mb-1 sm:!mb-2">15. Liability Disclaimer</h2>
                        <p>
                            You agree that the use of the Site is at your sole risk. The Site and the materials contained therein are provided on an "as is" and "as available" basis, except as otherwise expressly provided for in this Agreement. Pratham Herbs and its respective officers, directors, employees, affiliates and other representatives, successors and assigns of any of them (collectively, "Pratham Herbs Entities") expressly disclaim all warranties of any kind, whether express or implied, including, but not limited to the implied warranties of merchantability, fitness for a particular purpose and non-infringement.
                        </p>
                        <p>
                            Pratham Herbs Entities make no warranty that the Site will meet your requirements, the Site will be timely, secure, error free or uninterrupted, the results obtained from the Site will be accurate or reliable, the quality of any products, services, information or other material obtained by you through the Site will meet your expectations and any Site errors will be corrected. Pratham Herbs does not represent or warrant that materials in the Site are accurate, complete, reliable, current, or error-free.
                        </p>
                        <p>
                            To the maximum extent permitted by applicable law, in no event shall Pratham Herbs Entities be liable for any indirect, incidental, special or consequential damages (including damages for loss of business, loss of profits, loss of good will, loss of use, loss of data, cost of procuring substitute goods, services or information, litigation or the like), whether based on breach of contract, breach of warranty, tort (including negligence), product liability or otherwise, even if Pratham Herbs Entities are advised of the possibility of such damages.
                        </p>

                        <h2 className="text-[16px] sm:text-lg lg:text-xl font-bold text-gray-900 mt-5 sm:mt-6 !mb-1 sm:!mb-2">16. Contact Us</h2>
                        <p className="mb-2 text-sm sm:text-base">
                            If you have any questions, concerns, or notices of infringement, please contact our dedicated support team. We are available to assist you.
                        </p>
                        <p className="text-sm sm:text-base">
                            <span className="font-semibold text-gray-900 mr-2">Email Support:</span>
                            <a href="mailto:care@prathamherbs.com" className="text-[#458500] hover:text-[#366800] hover:underline font-bold break-all">
                                care@prathamherbs.com
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
