var xml = require('xml');

class Controller {
    static list(req, res) {
        res.set('Content-Type', 'text/xml');
        res.status(200).send(`
        <source>
            <publisher-name>RecruiterPal</publisher-name>
            <publisher>RecruiterPal</publisher>
            <publisher-url>https://recruiterpal.com</publisher-url>
            <publisherUrl>https://recruiterpal.com</publisherUrl>
            <last-build-date>Mon, 06 Nov 2023 13:33:16 GMT</last-build-date>
            <lastBuildDate>Mon, 06 Nov 2023 13:33:16 GMT</lastBuildDate>
            <build-id>e1c3bd33-146a-43e5-bcdc-a2c163023a82</build-id>
            <buildId>e1c3bd33-146a-43e5-bcdc-a2c163023a82</buildId>
            <job>
                <city>
                    <![CDATA[ Singapore ]]>
                </city>
                <title>
                    <![CDATA[ Accounting Executive ]]>
                </title>
                <salary>
                    <salary-to>
                        <![CDATA[ 4000 ]]>
                    </salary-to>
                    <salary-from>
                        <![CDATA[ 3000 ]]>
                    </salary-from>
                    <salary-hidden>
                        <![CDATA[ FALSE ]]>
                    </salary-hidden>
                    <salary-period>
                        <![CDATA[ Monthly ]]>
                    </salary-period>
                    <salary-currency>
                        <![CDATA[ SGD ]]>
                    </salary-currency>
                </salary>
                <skills>
                    <skill>
                        <![CDATA[ Global Mindset ]]>
                    </skill>
                    <skill>
                        <![CDATA[ Decision Making ]]>
                    </skill>
                    <skill>
                        <![CDATA[ Digital Literacy ]]>
                    </skill>
                    <skill>
                        <![CDATA[ Communication ]]>
                    </skill>
                    <skill>
                        <![CDATA[ Creative Thinking ]]>
                    </skill>
                </skills>
                <address>
                    <![CDATA[ 18 Boon Lay Way #07-121 Tradehub21 ]]>
                </address>
                <company>
                    <![CDATA[ ACME Singapore Pte Ltd ]]>
                </company>
                <country>
                    <![CDATA[ SG ]]>
                </country>
                <industry>
                    <![CDATA[ Banking & Financial Services ]]>
                </industry>
                <job-link>
                    <![CDATA[ http://empdemo.nemo.recruiterpal.com/career/jobs/nvnng ]]>
                </job-link>
                <job-roles>
                    <job-role>
                        <![CDATA[ Basic Accounting/Bookkeeping/Accounts Executive ]]>
                    </job-role>
                </job-roles>
                <vacancies>
                    <![CDATA[ 1 ]]>
                </vacancies>
                <postal-code>
                    <![CDATA[ 609966 ]]>
                </postal-code>
                <posted-date>
                    <![CDATA[ 2023-11-06 01:32:35 +0800 ]]>
                </posted-date>
                <closing-date>
                    <![CDATA[ 2023-12-06 01:32:35 +0800 ]]>
                </closing-date>
                <company-logo>
                    <![CDATA[ http://tmsapi.nemo.recruiterpal.com/v1/external/entity-asset-stream/837zm/entity-type/8kr94/entity-id/8dewm/file-type/business-profile-logo ]]>
                </company-logo>
                <job-functions>
                    <job-function>
                        <![CDATA[ Accounting ]]>
                    </job-function>
                </job-functions>
                <company-ref-id>
                    <![CDATA[ qj20rw ]]>
                </company-ref-id>
                <posting-ref-id>
                    <![CDATA[ nvnng ]]>
                </posting-ref-id>
                <qualifications>
                    <![CDATA[ <ul><li>accounting</li></ul> ]]>
                </qualifications>
                <job-description>
                    <![CDATA[ <p>The Accounting Executive reports to the Management Accountant to support the finance department in carrying out the responsibilities of the accounting department. He/She covers duties such as work that is specific to preliminary cost analyses and report preparation. This requires a basic understanding of the business structures, operations and financial performance. He/She may be called on to participate in ad-hoc finance-related projects and systems testing when necessary.</p><ul><li><div>Manage efficiency and effectiveness of resource allocation</div><ul><li>Analyse and prepare financial ratio, liquidity ratio, working capital ratio and gearing ratio</li><li>Prepare cost analysis</li></ul></li></ul><ul><li><div>Support strategic planning</div><ul><li>Assist in profit and loss analysis</li><li>Assist in the balance sheet analysis and reconciliations process</li><li>Assist in the budgeting and forecasting process</li></ul></li></ul> ]]>
                </job-description>
                <education-levels>
                    <education-level>
                        <![CDATA[ Diploma ]]>
                    </education-level>
                </education-levels>
                <employment-types>
                    <employment-type>
                        <![CDATA[ Full Time ]]>
                    </employment-type>
                    <employment-type>
                        <![CDATA[ Contract ]]>
                    </employment-type>
                </employment-types>
                <experience-levels>
                    <experience-level>
                        <![CDATA[ Executive ]]>
                    </experience-level>
                </experience-levels>
                <last-updated-date>
                    <![CDATA[ 2023-11-06 06:32:28 +0800 ]]>
                </last-updated-date>
                <other-information>
                    <![CDATA[ ]]>
                </other-information>
                <company-description>
                    <![CDATA[ <p>A leading general insurer with a local presence of over 100 years, ACME Singapore offers an extensive range of insurance solutions for commercial and personal risk protection, enabling the security and safety of individuals and businesses. ACME Singapore holds an A+/Stable financial rating by Standard & Poor's. A testament to its growing strength and influence, ACME Singapore has garnered numerous awards for delivering digitally innovative and customer-centric solutions. In 2023, 2022 and 2020, ACME Singapore was awarded Insurance Asia Awards Claims Initiative of the Year. ACME is a subsidiary of Mitsui Sumitomo Insurance Co., Ltd, and a member of the MS&AD Insurance Group one of the largest general insurance groups in the world with presence in 50 countries and regions globally, 18 of which are in Asia Pacific including all ASEAN markets as well as in Australia, New Zealand, China, Hong Kong, Taiwan, South Korea and India. Headquartered in Japan, MS&AD is amongst the top non-life insurance groups in the world based on gross revenue.</p> ]]>
                </company-description>
                <years-of-experience>
                    <![CDATA[ 2 ]]>
                </years-of-experience>
            </job>
            <job>
                <city>
                    <![CDATA[ Singapore ]]>
                </city>
                <title>
                    <![CDATA[ Customer Service Officer ]]>
                </title>
                <salary>
                    <salary-to>
                        <![CDATA[ 2500 ]]>
                    </salary-to>
                    <salary-from>
                        <![CDATA[ 1500 ]]>
                    </salary-from>
                    <salary-hidden>
                        <![CDATA[ FALSE ]]>
                    </salary-hidden>
                    <salary-period>
                        <![CDATA[ Monthly ]]>
                    </salary-period>
                    <salary-currency>
                        <![CDATA[ SGD ]]>
                    </salary-currency>
                </salary>
                <skills/>
                <address>
                    <![CDATA[ 2, Orchard Turn, ION Orchard, #04-20, Singapore 238801 ]]>
                </address>
                <company>
                    <![CDATA[ Royal RP (S) Pte Ltd ]]>
                </company>
                <country>
                    <![CDATA[ SG ]]>
                </country>
                <industry>
                    <![CDATA[ Luxury Brands ]]>
                </industry>
                <job-link>
                    <![CDATA[ http://empdemo2.nemo.recruiterpal.com/career/jobs/vg33w ]]>
                </job-link>
                <job-roles>
                    <job-role>
                        <![CDATA[ Customer Service - General ]]>
                    </job-role>
                </job-roles>
                <vacancies>
                    <![CDATA[ 10 ]]>
                </vacancies>
                <postal-code>
                    <![CDATA[ 238801 ]]>
                </postal-code>
                <posted-date>
                    <![CDATA[ 2023-11-06 01:32:36 +0800 ]]>
                </posted-date>
                <closing-date>
                    <![CDATA[ 2023-12-06 01:32:36 +0800 ]]>
                </closing-date>
                <company-logo>
                    <![CDATA[ http://tmsapi.nemo.recruiterpal.com/v1/external/entity-asset-stream/837zm/entity-type/8kr94/entity-id/amb18/file-type/business-profile-logo ]]>
                </company-logo>
                <job-functions>
                    <job-function>
                        <![CDATA[ Customer Service ]]>
                    </job-function>
                </job-functions>
                <company-ref-id>
                    <![CDATA[ g2qfl ]]>
                </company-ref-id>
                <posting-ref-id>
                    <![CDATA[ vg33w ]]>
                </posting-ref-id>
                <qualifications>
                    <![CDATA[ <ul><li>GCE N / O Level with knowledge of Microsoft Office software</li><li>Empathetic, possess good communication skills with a pleasant disposition</li><li>Able to work on rotating shifts, weekends and public holidays</li></ul> ]]>
                </qualifications>
                <job-description>
                    <![CDATA[ <p>Attend to shoppers / tenants enquiries and feedback at the Information Counter. Other duties include assisting in mall loyalty and redemption programmes, handle sales of tickets, vouchers, etc.</p> ]]>
                </job-description>
                <education-levels>
                    <education-level>
                        <![CDATA[ GCE N Levels ]]>
                    </education-level>
                    <education-level>
                        <![CDATA[ GCE O Levels ]]>
                    </education-level>
                </education-levels>
                <employment-types>
                    <employment-type>
                        <![CDATA[ Full Time ]]>
                    </employment-type>
                </employment-types>
                <experience-levels>
                    <experience-level>
                        <![CDATA[ Entry Level ]]>
                    </experience-level>
                    <experience-level>
                        <![CDATA[ Non-Executive ]]>
                    </experience-level>
                </experience-levels>
                <last-updated-date>
                    <![CDATA[ 2023-11-06 06:32:28 +0800 ]]>
                </last-updated-date>
                <other-information>
                    <![CDATA[ <p>information</p> ]]>
                </other-information>
                <company-description>
                    <![CDATA[ <p>Mercatus Co-operative Limited is the real estate subsidiary of NTUC Enterprise Co-operative Limited. Its vision is to own and manage a portfolio of commercial properties to provide NTUC social enterprises with access to commercial space and generate sustainable, long term returns for the Labour Movement.</p> ]]>
                </company-description>
                <years-of-experience>
                    <![CDATA[ 0 ]]>
                </years-of-experience>
            </job>
            <job>
                <city>
                    <![CDATA[ Singapore ]]>
                </city>
                <title>
                    <![CDATA[ Accounting Executive ]]>
                </title>
                <salary>
                    <salary-hidden>
                        <![CDATA[ TRUE ]]>
                    </salary-hidden>
                </salary>
                <skills>
                    <skill>
                        <![CDATA[ Global Mindset ]]>
                    </skill>
                    <skill>
                        <![CDATA[ Decision Making ]]>
                    </skill>
                    <skill>
                        <![CDATA[ Digital Literacy ]]>
                    </skill>
                    <skill>
                        <![CDATA[ Communication ]]>
                    </skill>
                </skills>
                <address>
                    <![CDATA[ 18 Boon Lay Way #07-121 Tradehub21 ]]>
                </address>
                <company>
                    <![CDATA[ ACME Singapore Pte Ltd ]]>
                </company>
                <country>
                    <![CDATA[ SG ]]>
                </country>
                <industry>
                    <![CDATA[ Banking & Financial Services ]]>
                </industry>
                <job-link>
                    <![CDATA[ http://empdemo.nemo.recruiterpal.com/career/jobs/e7bb2 ]]>
                </job-link>
                <job-roles>
                    <job-role>
                        <![CDATA[ Basic Accounting/Bookkeeping/Accounts Executive ]]>
                    </job-role>
                </job-roles>
                <vacancies>
                    <![CDATA[ 1 ]]>
                </vacancies>
                <postal-code>
                    <![CDATA[ 609966 ]]>
                </postal-code>
                <posted-date>
                    <![CDATA[ 2023-11-06 01:32:36 +0800 ]]>
                </posted-date>
                <closing-date>
                    <![CDATA[ 2023-12-06 01:32:36 +0800 ]]>
                </closing-date>
                <company-logo>
                    <![CDATA[ http://tmsapi.nemo.recruiterpal.com/v1/external/entity-asset-stream/837zm/entity-type/8kr94/entity-id/8dewm/file-type/business-profile-logo ]]>
                </company-logo>
                <job-functions>
                    <job-function>
                        <![CDATA[ Accounting ]]>
                    </job-function>
                </job-functions>
                <company-ref-id>
                    <![CDATA[ qj20rw ]]>
                </company-ref-id>
                <posting-ref-id>
                    <![CDATA[ e7bb2 ]]>
                </posting-ref-id>
                <qualifications>
                    <![CDATA[ <ul><li>Accounting discipline</li></ul> ]]>
                </qualifications>
                <job-description>
                    <![CDATA[ <p>The Accounting Executive reports to the Management Accountant to support the finance department in carrying out the responsibilities of the accounting department. He/She covers duties such as work that is specific to preliminary cost analyses and report preparation. This requires a basic understanding of the business structures, operations and financial performance. He/She may be called on to participate in ad-hoc finance-related projects and systems testing when necessary.</p><ul><li><div>Manage efficiency and effectiveness of resource allocation</div><ul><li>Analyse and prepare financial ratio, liquidity ratio, working capital ratio and gearing ratio</li><li>Prepare cost analysis</li></ul></li></ul><ul><li><div>Support strategic planning</div><ul><li>Assist in profit and loss analysis</li><li>Assist in the balance sheet analysis and reconciliations process</li><li>Assist in the budgeting and forecasting process</li></ul></li></ul> ]]>
                </job-description>
                <education-levels>
                    <education-level>
                        <![CDATA[ Diploma ]]>
                    </education-level>
                </education-levels>
                <employment-types>
                    <employment-type>
                        <![CDATA[ Full Time ]]>
                    </employment-type>
                    <employment-type>
                        <![CDATA[ Contract ]]>
                    </employment-type>
                </employment-types>
                <experience-levels>
                    <experience-level>
                        <![CDATA[ Executive ]]>
                    </experience-level>
                </experience-levels>
                <last-updated-date>
                    <![CDATA[ 2023-11-06 06:32:28 +0800 ]]>
                </last-updated-date>
                <other-information>
                    <![CDATA[ ]]>
                </other-information>
                <company-description>
                    <![CDATA[ <p>A leading general insurer with a local presence of over 100 years, ACME Singapore offers an extensive range of insurance solutions for commercial and personal risk protection, enabling the security and safety of individuals and businesses. ACME Singapore holds an A+/Stable financial rating by Standard & Poor's. A testament to its growing strength and influence, ACME Singapore has garnered numerous awards for delivering digitally innovative and customer-centric solutions. In 2023, 2022 and 2020, ACME Singapore was awarded Insurance Asia Awards Claims Initiative of the Year. ACME is a subsidiary of Mitsui Sumitomo Insurance Co., Ltd, and a member of the MS&AD Insurance Group one of the largest general insurance groups in the world with presence in 50 countries and regions globally, 18 of which are in Asia Pacific including all ASEAN markets as well as in Australia, New Zealand, China, Hong Kong, Taiwan, South Korea and India. Headquartered in Japan, MS&AD is amongst the top non-life insurance groups in the world based on gross revenue.</p> ]]>
                </company-description>
                <years-of-experience>
                    <![CDATA[ 2 ]]>
                </years-of-experience>
            </job>
            <job>
                <city>
                    <![CDATA[ Singapore ]]>
                </city>
                <title>
                    <![CDATA[ Financial Planner ]]>
                </title>
                <salary>
                    <salary-to>
                        <![CDATA[ 3000 ]]>
                    </salary-to>
                    <salary-from>
                        <![CDATA[ 2500 ]]>
                    </salary-from>
                    <salary-hidden>
                        <![CDATA[ FALSE ]]>
                    </salary-hidden>
                    <salary-period>
                        <![CDATA[ Monthly ]]>
                    </salary-period>
                    <salary-currency>
                        <![CDATA[ SGD ]]>
                    </salary-currency>
                </salary>
                <skills>
                    <skill>
                        <![CDATA[ Cfmas ]]>
                    </skill>
                </skills>
                <address>
                    <![CDATA[ 18 Boon Lay Way #07-121 Tradehub21 ]]>
                </address>
                <company>
                    <![CDATA[ ACME Singapore Pte Ltd ]]>
                </company>
                <country>
                    <![CDATA[ SG ]]>
                </country>
                <industry>
                    <![CDATA[ Banking & Financial Services ]]>
                </industry>
                <job-link>
                    <![CDATA[ http://empdemo.nemo.recruiterpal.com/career/jobs/41gg9 ]]>
                </job-link>
                <job-roles>
                    <job-role>
                        <![CDATA[ Insurance Agent ]]>
                    </job-role>
                    <job-role>
                        <![CDATA[ Financial Planning/Wealth Management ]]>
                    </job-role>
                </job-roles>
                <vacancies>
                    <![CDATA[ 5 ]]>
                </vacancies>
                <postal-code>
                    <![CDATA[ 609966 ]]>
                </postal-code>
                <posted-date>
                    <![CDATA[ 2023-11-06 01:32:36 +0800 ]]>
                </posted-date>
                <closing-date>
                    <![CDATA[ 2023-12-06 01:32:36 +0800 ]]>
                </closing-date>
                <company-logo>
                    <![CDATA[ http://tmsapi.nemo.recruiterpal.com/v1/external/entity-asset-stream/837zm/entity-type/8kr94/entity-id/8dewm/file-type/business-profile-logo ]]>
                </company-logo>
                <job-functions>
                    <job-function>
                        <![CDATA[ Insurance Agents/Brokers ]]>
                    </job-function>
                </job-functions>
                <company-ref-id>
                    <![CDATA[ qj20rw ]]>
                </company-ref-id>
                <posting-ref-id>
                    <![CDATA[ 41gg9 ]]>
                </posting-ref-id>
                <qualifications>
                    <![CDATA[ <ul><li>Candidate must be 21 years old and above (MAS Regulatory Requirement)</li><li>Candidate must possess at least Higher secondary/Pre-U/A level/College, Diploma/Advanced/Higher/Graduate Diploma, Bachelor's Degree/Post Graduate Diploma/Professional Degree in any field.</li><li>No work experience required.</li><li>Preferably Entry Level specialized in Sales - Financial Services (Insurance, Unit Trust, etc) or equivalent.</li></ul> ]]>
                </qualifications>
                <job-description>
                    <![CDATA[ <p><strong> Basic pay + Attractive Incentives* + Bonus*!</strong></p><p><strong> Overseas travelling Opportunities with Company*!</strong></p><p><strong> Academic Enrichment, strong mentorship & coaching programs*!</strong></p><p></p><p><strong>Responsibilities</strong></p><ul><li>Understanding the client's financial goals, aspirations and concerns</li><li>Developing and recommending of a comprehensive financial plan to help the clients achieve their financial goals (investments, protection, retirement planning, savings etc.) in all life stages</li><li>Acquiring new clients and building relationships with existing clients by providing sound financial advice and excellent customer service</li></ul> ]]>
                </job-description>
                <education-levels>
                    <education-level>
                        <![CDATA[ Diploma ]]>
                    </education-level>
                    <education-level>
                        <![CDATA[ Bachelor's Degree or equivalent ]]>
                    </education-level>
                </education-levels>
                <employment-types>
                    <employment-type>
                        <![CDATA[ Full Time ]]>
                    </employment-type>
                    <employment-type>
                        <![CDATA[ Part Time ]]>
                    </employment-type>
                </employment-types>
                <experience-levels>
                    <experience-level>
                        <![CDATA[ Entry Level ]]>
                    </experience-level>
                    <experience-level>
                        <![CDATA[ Non-Executive ]]>
                    </experience-level>
                    <experience-level>
                        <![CDATA[ Executive ]]>
                    </experience-level>
                    <experience-level>
                        <![CDATA[ Manager ]]>
                    </experience-level>
                    <experience-level>
                        <![CDATA[ Middle Management ]]>
                    </experience-level>
                    <experience-level>
                        <![CDATA[ Senior Management ]]>
                    </experience-level>
                </experience-levels>
                <last-updated-date>
                    <![CDATA[ 2023-11-06 06:32:28 +0800 ]]>
                </last-updated-date>
                <other-information>
                    <![CDATA[ ]]>
                </other-information>
                <company-description>
                    <![CDATA[ <p><strong>Mission & Vision of SKYO</strong></p><p>Our organization focuses on grooming like-minded people who are focused, driven and dare to dream<strong>BIG</strong>.We also believe in building a fun, rewarding, dynamic and engaging team that is able to bring out the fullest potential in every individual where everyone thrives in a well-supported environment of strong leadership, core values and camaraderie.Persistency and consistency is what we advocate to all our valued clients and associates:Success is a<strong>habit</strong>and<strong>no one</strong>is left behind."Life will pay any price you ask of it!" - Anthony Robbins.</p> ]]>
                </company-description>
                <years-of-experience>
                    <![CDATA[ 0 ]]>
                </years-of-experience>
            </job>
            <job>
                <city>
                    <![CDATA[ Singapore ]]>
                </city>
                <title>
                    <![CDATA[ Customer Service Officer ]]>
                </title>
                <salary>
                    <salary-to>
                        <![CDATA[ 3000 ]]>
                    </salary-to>
                    <salary-from>
                        <![CDATA[ 2000 ]]>
                    </salary-from>
                    <salary-hidden>
                        <![CDATA[ FALSE ]]>
                    </salary-hidden>
                    <salary-period>
                        <![CDATA[ Monthly ]]>
                    </salary-period>
                    <salary-currency>
                        <![CDATA[ SGD ]]>
                    </salary-currency>
                </salary>
                <skills/>
                <address>
                    <![CDATA[ 18 Boon Lay Way #07-121 Tradehub21 ]]>
                </address>
                <company>
                    <![CDATA[ ACME Singapore Pte Ltd ]]>
                </company>
                <country>
                    <![CDATA[ SG ]]>
                </country>
                <industry>
                    <![CDATA[ Banking & Financial Services ]]>
                </industry>
                <job-link>
                    <![CDATA[ http://empdemo.nemo.recruiterpal.com/career/jobs/pvkkd ]]>
                </job-link>
                <job-roles>
                    <job-role>
                        <![CDATA[ Customer Service - General ]]>
                    </job-role>
                    <job-role>
                        <![CDATA[ Others ]]>
                    </job-role>
                </job-roles>
                <vacancies>
                    <![CDATA[ 5 ]]>
                </vacancies>
                <postal-code>
                    <![CDATA[ 609966 ]]>
                </postal-code>
                <posted-date>
                    <![CDATA[ 2023-11-06 01:32:36 +0800 ]]>
                </posted-date>
                <closing-date>
                    <![CDATA[ 2023-12-06 01:32:36 +0800 ]]>
                </closing-date>
                <company-logo>
                    <![CDATA[ http://tmsapi.nemo.recruiterpal.com/v1/external/entity-asset-stream/837zm/entity-type/8kr94/entity-id/8dewm/file-type/business-profile-logo ]]>
                </company-logo>
                <job-functions>
                    <job-function>
                        <![CDATA[ Customer Service ]]>
                    </job-function>
                    <job-function>
                        <![CDATA[ Receptionist ]]>
                    </job-function>
                </job-functions>
                <company-ref-id>
                    <![CDATA[ qj20rw ]]>
                </company-ref-id>
                <posting-ref-id>
                    <![CDATA[ pvkkd ]]>
                </posting-ref-id>
                <qualifications>
                    <![CDATA[ <ul><li><div><h3>What you'll need:</h3><ul><li>Minimum of Diploma/Fresh Graduate preferred</li><li>Singaporeans Only</li><li>0-2 years of customer service related and administrative experience</li><li>Ability to communicate effectively, resolve conflicts and handle customer complaints</li><li>Ability to perform operational duties and team project responsibilities</li><li>Proficient in MS office application, in particular MS Excel</li><li>Ability to work efficiently with minimal supervision in a changing environment, multitask, and is a self-starter</li><li>Able to communicate in English</li></ul><h3></h3></div></li></ul> ]]>
                </qualifications>
                <job-description>
                    <![CDATA[ <ul><li>Customer service at front desk</li><li>Responsible for calling and sending SMS reminders to customers for their appointment</li><li>Generation of daily reports</li><li>Responsible for outlet stock-take and administrative duties</li></ul> ]]>
                </job-description>
                <education-levels>
                    <education-level>
                        <![CDATA[ Diploma ]]>
                    </education-level>
                </education-levels>
                <employment-types>
                    <employment-type>
                        <![CDATA[ Full Time ]]>
                    </employment-type>
                </employment-types>
                <experience-levels>
                    <experience-level>
                        <![CDATA[ Entry Level ]]>
                    </experience-level>
                </experience-levels>
                <last-updated-date>
                    <![CDATA[ 2023-11-06 06:32:28 +0800 ]]>
                </last-updated-date>
                <other-information>
                    <![CDATA[ <h3>Additionally:</h3><ul><li>Ability to commit to shift hours and timing</li><li>5 days work week from Monday to Sunday</li><li>Shift hours: 8am-5pm / 9am-6pm/ 10am-7pm/ 12pm-9pm / 1pm-10pm</li></ul> ]]>
                </other-information>
                <company-description>
                    <![CDATA[ <p>Starbucks Coffee is the leading retailer, roaster and brand of specialty coffee in the world. Striving for the best cup of coffee and beverage for each customer that walks into the store, Starbucks Coffee creates Starbucks Experience with coffee expertise, passionate partners, community engagement, coffee culture and innovative transformation.</p><p>Starbucks Coffee Indonesia opened its first store in Plaza Indonesia, 17 May 2002. With a rapid development, strategic locations, and engaging marketing tactics, Starbucks Coffee Indonesia is now are in different 338 locations all around major cities of Indonesia, serving Indonesians, genuinely one cup at a time.</p> ]]>
                </company-description>
                <years-of-experience>
                    <![CDATA[ 1 ]]>
                </years-of-experience>
            </job>
            <job>
                <city>
                    <![CDATA[ Singapore ]]>
                </city>
                <title>
                    <![CDATA[ Financial Planner ]]>
                </title>
                <salary>
                    <salary-to>
                        <![CDATA[ 3000 ]]>
                    </salary-to>
                    <salary-from>
                        <![CDATA[ 2500 ]]>
                    </salary-from>
                    <salary-hidden>
                        <![CDATA[ FALSE ]]>
                    </salary-hidden>
                    <salary-period>
                        <![CDATA[ Monthly ]]>
                    </salary-period>
                    <salary-currency>
                        <![CDATA[ SGD ]]>
                    </salary-currency>
                </salary>
                <skills/>
                <address>
                    <![CDATA[ 18 Boon Lay Way #07-121 Tradehub21 ]]>
                </address>
                <company>
                    <![CDATA[ ACME Singapore Pte Ltd ]]>
                </company>
                <country>
                    <![CDATA[ SG ]]>
                </country>
                <industry>
                    <![CDATA[ Banking & Financial Services ]]>
                </industry>
                <job-link>
                    <![CDATA[ http://empdemo.nemo.recruiterpal.com/career/jobs/9ejjj ]]>
                </job-link>
                <job-roles>
                    <job-role>
                        <![CDATA[ Insurance Agent ]]>
                    </job-role>
                    <job-role>
                        <![CDATA[ Financial Planning/Wealth Management ]]>
                    </job-role>
                </job-roles>
                <vacancies>
                    <![CDATA[ 5 ]]>
                </vacancies>
                <postal-code>
                    <![CDATA[ 609966 ]]>
                </postal-code>
                <posted-date>
                    <![CDATA[ 2023-11-06 01:32:36 +0800 ]]>
                </posted-date>
                <closing-date>
                    <![CDATA[ 2023-12-06 01:32:36 +0800 ]]>
                </closing-date>
                <company-logo>
                    <![CDATA[ http://tmsapi.nemo.recruiterpal.com/v1/external/entity-asset-stream/837zm/entity-type/8kr94/entity-id/8dewm/file-type/business-profile-logo ]]>
                </company-logo>
                <job-functions>
                    <job-function>
                        <![CDATA[ Insurance Agents/Brokers ]]>
                    </job-function>
                </job-functions>
                <company-ref-id>
                    <![CDATA[ qj20rw ]]>
                </company-ref-id>
                <posting-ref-id>
                    <![CDATA[ 9ejjj ]]>
                </posting-ref-id>
                <qualifications>
                    <![CDATA[ <ul><li>Candidate must be 21 years old and above (MAS Regulatory Requirement)</li><li>Candidate must possess at least Higher secondary/Pre-U/A level/College, Diploma/Advanced/Higher/Graduate Diploma, Bachelor's Degree/Post Graduate Diploma/Professional Degree in any field.</li><li>No work experience required.</li><li>Preferably Entry Level specialized in Sales - Financial Services (Insurance, Unit Trust, etc) or equivalent.</li></ul> ]]>
                </qualifications>
                <job-description>
                    <![CDATA[ <p><strong> Basic pay + Attractive Incentives* + Bonus*!</strong></p><p><strong> Overseas travelling Opportunities with Company*!</strong></p><p><strong> Academic Enrichment, strong mentorship & coaching programs*!</strong></p><p></p><p><strong>Responsibilities</strong></p><ul><li>Understanding the client's financial goals, aspirations and concerns</li><li>Developing and recommending of a comprehensive financial plan to help the clients achieve their financial goals (investments, protection, retirement planning, savings etc.) in all life stages</li><li>Acquiring new clients and building relationships with existing clients by providing sound financial advice and excellent customer service</li></ul> ]]>
                </job-description>
                <education-levels>
                    <education-level>
                        <![CDATA[ Diploma ]]>
                    </education-level>
                    <education-level>
                        <![CDATA[ Bachelor's Degree or equivalent ]]>
                    </education-level>
                </education-levels>
                <employment-types>
                    <employment-type>
                        <![CDATA[ Full Time ]]>
                    </employment-type>
                    <employment-type>
                        <![CDATA[ Part Time ]]>
                    </employment-type>
                </employment-types>
                <experience-levels>
                    <experience-level>
                        <![CDATA[ Entry Level ]]>
                    </experience-level>
                    <experience-level>
                        <![CDATA[ Non-Executive ]]>
                    </experience-level>
                    <experience-level>
                        <![CDATA[ Executive ]]>
                    </experience-level>
                    <experience-level>
                        <![CDATA[ Manager ]]>
                    </experience-level>
                    <experience-level>
                        <![CDATA[ Middle Management ]]>
                    </experience-level>
                    <experience-level>
                        <![CDATA[ Senior Management ]]>
                    </experience-level>
                </experience-levels>
                <last-updated-date>
                    <![CDATA[ 2023-11-06 06:32:28 +0800 ]]>
                </last-updated-date>
                <other-information>
                    <![CDATA[ ]]>
                </other-information>
                <company-description>
                    <![CDATA[ <p><strong>Mission & Vision of SKYO</strong></p><p>Our organization focuses on grooming like-minded people who are focused, driven and dare to dream<strong>BIG</strong>.We also believe in building a fun, rewarding, dynamic and engaging team that is able to bring out the fullest potential in every individual where everyone thrives in a well-supported environment of strong leadership, core values and camaraderie.Persistency and consistency is what we advocate to all our valued clients and associates:Success is a<strong>habit</strong>and<strong>no one</strong>is left behind."Life will pay any price you ask of it!" - Anthony Robbins.</p> ]]>
                </company-description>
                <years-of-experience>
                    <![CDATA[ 0 ]]>
                </years-of-experience>
            </job>
            <job>
                <city>
                    <![CDATA[ Singapore ]]>
                </city>
                <title>
                    <![CDATA[ HR Executive ]]>
                </title>
                <salary>
                    <salary-hidden>
                        <![CDATA[ TRUE ]]>
                    </salary-hidden>
                </salary>
                <skills/>
                <address>
                    <![CDATA[ 7 Temasek Blvd ]]>
                </address>
                <company>
                    <![CDATA[ RecruiterPal (MR) ]]>
                </company>
                <country>
                    <![CDATA[ SG ]]>
                </country>
                <industry>
                    <![CDATA[ Software ]]>
                </industry>
                <job-link>
                    <![CDATA[ http://empdemo4.nemo.recruiterpal.com/career/jobs/jvkka ]]>
                </job-link>
                <job-roles>
                    <job-role>
                        <![CDATA[ Others ]]>
                    </job-role>
                </job-roles>
                <vacancies>
                    <![CDATA[ 10 ]]>
                </vacancies>
                <postal-code>
                    <![CDATA[ 038987 ]]>
                </postal-code>
                <posted-date>
                    <![CDATA[ 2023-11-06 01:32:36 +0800 ]]>
                </posted-date>
                <closing-date>
                    <![CDATA[ 2023-12-06 01:32:36 +0800 ]]>
                </closing-date>
                <company-logo>
                    <![CDATA[ http://tmsapi.nemo.recruiterpal.com/v1/external/entity-asset-stream/837zm/entity-type/8kr94/entity-id/8qjdy/file-type/business-profile-logo ]]>
                </company-logo>
                <job-functions>
                    <job-function>
                        <![CDATA[ Generalist ]]>
                    </job-function>
                </job-functions>
                <company-ref-id>
                    <![CDATA[ bqwso4 ]]>
                </company-ref-id>
                <posting-ref-id>
                    <![CDATA[ jvkka ]]>
                </posting-ref-id>
                <qualifications>
                    <![CDATA[ <ul><li>Job qualifications</li></ul> ]]>
                </qualifications>
                <job-description>
                    <![CDATA[ <ul><li>Job description</li></ul> ]]>
                </job-description>
                <education-levels>
                    <education-level>
                        <![CDATA[ Bachelor's Degree or equivalent ]]>
                    </education-level>
                    <education-level>
                        <![CDATA[ Graduate Diploma ]]>
                    </education-level>
                </education-levels>
                <employment-types>
                    <employment-type>
                        <![CDATA[ Full Time ]]>
                    </employment-type>
                </employment-types>
                <experience-levels>
                    <experience-level>
                        <![CDATA[ Executive ]]>
                    </experience-level>
                </experience-levels>
                <last-updated-date>
                    <![CDATA[ 2023-11-06 06:32:28 +0800 ]]>
                </last-updated-date>
                <other-information>
                    <![CDATA[ ]]>
                </other-information>
                <company-description>
                    <![CDATA[ <p>At RecruiterPal, we see ourselves as change agents; We are driven to make a real difference in the way our clients manage recruitment and talent acquisition efforts. Through the use of our recruitment technology, we have empowered our clients to connect faster, better and smarter with choice candidates, and enabled thousands of people in finding theirchoicecareer.</p><p>If you are intellectually curious bynature,and believe in the power of technology to change peoples' lives, we would love to have a conversation with you.</p> ]]>
                </company-description>
                <years-of-experience>
                    <![CDATA[ 3 ]]>
                </years-of-experience>
            </job>
            <job>
                <city>
                    <![CDATA[ Singapore ]]>
                </city>
                <title>
                    <![CDATA[ Financial Planner ]]>
                </title>
                <salary>
                    <salary-to>
                        <![CDATA[ 2000 ]]>
                    </salary-to>
                    <salary-from>
                        <![CDATA[ 1000 ]]>
                    </salary-from>
                    <salary-hidden>
                        <![CDATA[ FALSE ]]>
                    </salary-hidden>
                    <salary-period>
                        <![CDATA[ Monthly ]]>
                    </salary-period>
                    <salary-currency>
                        <![CDATA[ SGD ]]>
                    </salary-currency>
                </salary>
                <skills/>
                <address>
                    <![CDATA[ 18 Boon Lay Way #07-121 Tradehub21 ]]>
                </address>
                <company>
                    <![CDATA[ ACME Singapore Pte Ltd ]]>
                </company>
                <country>
                    <![CDATA[ SG ]]>
                </country>
                <industry>
                    <![CDATA[ Banking & Financial Services ]]>
                </industry>
                <job-link>
                    <![CDATA[ http://empdemo.nemo.recruiterpal.com/career/jobs/weqql ]]>
                </job-link>
                <job-roles>
                    <job-role>
                        <![CDATA[ Insurance Agent ]]>
                    </job-role>
                    <job-role>
                        <![CDATA[ Financial Planning/Wealth Management ]]>
                    </job-role>
                </job-roles>
                <vacancies>
                    <![CDATA[ 5 ]]>
                </vacancies>
                <postal-code>
                    <![CDATA[ 609966 ]]>
                </postal-code>
                <posted-date>
                    <![CDATA[ 2023-11-06 01:32:36 +0800 ]]>
                </posted-date>
                <closing-date>
                    <![CDATA[ 2023-12-06 01:32:36 +0800 ]]>
                </closing-date>
                <company-logo>
                    <![CDATA[ http://tmsapi.nemo.recruiterpal.com/v1/external/entity-asset-stream/837zm/entity-type/8kr94/entity-id/8dewm/file-type/business-profile-logo ]]>
                </company-logo>
                <job-functions>
                    <job-function>
                        <![CDATA[ Insurance Agents/Brokers ]]>
                    </job-function>
                </job-functions>
                <company-ref-id>
                    <![CDATA[ qj20rw ]]>
                </company-ref-id>
                <posting-ref-id>
                    <![CDATA[ weqql ]]>
                </posting-ref-id>
                <qualifications>
                    <![CDATA[ <ul><li>Candidate must be 21 years old and above (MAS Regulatory Requirement)</li><li>Candidate must possess at least Higher secondary/Pre-U/A level/College, Diploma/Advanced/Higher/Graduate Diploma, Bachelor's Degree/Post Graduate Diploma/Professional Degree in any field.</li><li>No work experience required.</li><li>Preferably Entry Level specialized in Sales - Financial Services (Insurance, Unit Trust, etc) or equivalent.</li></ul> ]]>
                </qualifications>
                <job-description>
                    <![CDATA[ <p><strong> Basic pay + Attractive Incentives* + Bonus*!</strong></p><p><strong> Overseas travelling Opportunities with Company*!</strong></p><p><strong> Academic Enrichment, strong mentorship & coaching programs*!</strong></p><p></p><p><strong>Responsibilities</strong></p><ul><li>Understanding the client's financial goals, aspirations and concerns</li><li>Developing and recommending of a comprehensive financial plan to help the clients achieve their financial goals (investments, protection, retirement planning, savings etc.) in all life stages</li><li>Acquiring new clients and building relationships with existing clients by providing sound financial advice and excellent customer service</li></ul> ]]>
                </job-description>
                <education-levels>
                    <education-level>
                        <![CDATA[ Diploma ]]>
                    </education-level>
                    <education-level>
                        <![CDATA[ Bachelor's Degree or equivalent ]]>
                    </education-level>
                </education-levels>
                <employment-types>
                    <employment-type>
                        <![CDATA[ Full Time ]]>
                    </employment-type>
                    <employment-type>
                        <![CDATA[ Part Time ]]>
                    </employment-type>
                </employment-types>
                <experience-levels>
                    <experience-level>
                        <![CDATA[ Entry Level ]]>
                    </experience-level>
                    <experience-level>
                        <![CDATA[ Non-Executive ]]>
                    </experience-level>
                    <experience-level>
                        <![CDATA[ Executive ]]>
                    </experience-level>
                    <experience-level>
                        <![CDATA[ Manager ]]>
                    </experience-level>
                    <experience-level>
                        <![CDATA[ Middle Management ]]>
                    </experience-level>
                    <experience-level>
                        <![CDATA[ Senior Management ]]>
                    </experience-level>
                </experience-levels>
                <last-updated-date>
                    <![CDATA[ 2023-11-06 06:32:28 +0800 ]]>
                </last-updated-date>
                <other-information>
                    <![CDATA[ ]]>
                </other-information>
                <company-description>
                    <![CDATA[ <p><strong>Mission & Vision of SKYO</strong></p><p>Our organization focuses on grooming like-minded people who are focused, driven and dare to dream<strong>BIG</strong>.We also believe in building a fun, rewarding, dynamic and engaging team that is able to bring out the fullest potential in every individual where everyone thrives in a well-supported environment of strong leadership, core values and camaraderie.Persistency and consistency is what we advocate to all our valued clients and associates:Success is a<strong>habit</strong>and<strong>no one</strong>is left behind."Life will pay any price you ask of it!" - Anthony Robbins.</p> ]]>
                </company-description>
                <years-of-experience>
                    <![CDATA[ 0 ]]>
                </years-of-experience>
            </job>
            <job>
                <city>
                    <![CDATA[ Singapore ]]>
                </city>
                <title>
                    <![CDATA[ Finance Manager ]]>
                </title>
                <salary>
                    <salary-hidden>
                        <![CDATA[ TRUE ]]>
                    </salary-hidden>
                </salary>
                <skills>
                    <skill>
                        <![CDATA[ Leadership ]]>
                    </skill>
                    <skill>
                        <![CDATA[ Interpersonal Skills ]]>
                    </skill>
                    <skill>
                        <![CDATA[ Managing Diversity ]]>
                    </skill>
                    <skill>
                        <![CDATA[ Developing People ]]>
                    </skill>
                    <skill>
                        <![CDATA[ Resource Management ]]>
                    </skill>
                </skills>
                <address>
                    <![CDATA[ 18 Boon Lay Way #07-121 Tradehub21 ]]>
                </address>
                <company>
                    <![CDATA[ ACME Singapore Pte Ltd ]]>
                </company>
                <country>
                    <![CDATA[ SG ]]>
                </country>
                <industry>
                    <![CDATA[ Banking & Financial Services ]]>
                </industry>
                <job-link>
                    <![CDATA[ http://empdemo.nemo.recruiterpal.com/career/jobs/ov99o ]]>
                </job-link>
                <job-roles>
                    <job-role>
                        <![CDATA[ Corporate Finance - Management ]]>
                    </job-role>
                </job-roles>
                <vacancies>
                    <![CDATA[ 1 ]]>
                </vacancies>
                <postal-code>
                    <![CDATA[ 609966 ]]>
                </postal-code>
                <posted-date>
                    <![CDATA[ 2023-11-06 01:32:36 +0800 ]]>
                </posted-date>
                <closing-date>
                    <![CDATA[ 2023-12-06 01:32:36 +0800 ]]>
                </closing-date>
                <company-logo>
                    <![CDATA[ http://tmsapi.nemo.recruiterpal.com/v1/external/entity-asset-stream/837zm/entity-type/8kr94/entity-id/8dewm/file-type/business-profile-logo ]]>
                </company-logo>
                <job-functions>
                    <job-function>
                        <![CDATA[ Corporate Finance ]]>
                    </job-function>
                </job-functions>
                <company-ref-id>
                    <![CDATA[ qj20rw ]]>
                </company-ref-id>
                <posting-ref-id>
                    <![CDATA[ ov99o ]]>
                </posting-ref-id>
                <qualifications>
                    <![CDATA[ <p>Qualifications</p> ]]>
                </qualifications>
                <job-description>
                    <![CDATA[ <p>The Finance Manager (FM) is the lead finance business partner for the organisation and has responsibilities covering all aspects of financial management, performance management, financial accounting, budgeting and corporate reporting. He/She reports to the Financial Controller. He/She must have sound technical as well as management skills and be able to lead a team consisting of finance professionals with varied, in-depth or niche technical knowledge and abilities. He/She consolidates their work and ensuring its quality and accuracy, especially for reporting purposes.<br><br>The FM is expected to provide sound financial advice and counsel (on working capital, financing or the financial position of the business) to the Financial Controller as well as the organisation's senior management and leadership team by synthesising internal and external data and studying the economic environment. He/She often has a key role in implementing best practices in order to identify and manage all financial and business risks and to meet the organisation's desired business and fiscal goals. He/She is expected to have a firm grasp of economic/business trends and to implement work improvement projects that are geared towards quality, compliance and efficiency in finance.</p><ul><li><div>Manage the organisation's management accounting and budgeting functions</div><ul><li>Adopt and promote Corporate Social Responsibility (CSR) reporting and its assurance using emerging frameworks to move towards an integrated reporting model combining financial and non-financial information</li><li>Evaluate current developments, such as sustainability rating systems, new frameworks and their potential impact on performance measurement and reporting</li><li>Maintain banking relationships for accounts for day-to-day transactions as well as investments</li><li>Prepare for the use and implementation of integrated reporting</li></ul></li></ul><ul><li><div>Drive the use and integration of information technology within the organisation's finance function</div><ul><li>Adopt cloud computing for the business</li><li>Ensure the appropriate set up of accounting rules in the organisation's financial system</li><li>Evaluate the effectiveness of the organisation's financial system and determine any areas of improvement</li><li>Identify and adopt business intelligence tools to analyse financial data and information</li><li>Use data mining and new analytical methodologies</li><li>Use management information systems strategically for effective management and control of the business</li></ul></li></ul><ul><li><div>Support the organisation as a business partner</div><ul><li>Advise management on the organisation's exposure to risks and the involvement of financial institutions, money market instruments and treasury management functions where applicable</li><li>Analyse and assess the impact of investment decisions on the financial position of the organisation</li><li>Analyse current market trends and provide strategic input to shape the organisation's key financial decisions</li><li>Analyse, compile and present management information for managerial decision making</li><li>Apply appropriate appraisal techniques and consideration for taxation, inflation and risk in investment decisions</li><li>Review the valuation of business and financial assets using different models</li></ul></li></ul><ul><li><div>Manage the organisation's financial accounting and corporate reporting functions</div><ul><li>Analyse the financial performance and position of the organisation and develop suitable accounting policies to meet reporting requirements</li><li>Apply professional judgement to identify accounting treatments adopted in financial statements and assess their suitability and acceptability</li><li>Appraise the financial performance and position of entities</li><li>Calculate accounting ratios relating to profitability, liquidity, efficiency and position</li><li>Develop accounting policies that meet reporting requirements and align with business models</li><li>Evaluate the various valuation models used by standard setters</li><li>Manage a documented system of accounting policies and procedures</li><li>Monitor changes and emerging trends in accounting standards and regulation</li><li>Provide financial leadership and strategic thinking to support sustainable value-creation</li><li>Supervise and review the preparation of consolidated financial statements, business activity reports and forecasts for management and external stakeholders</li></ul></li></ul><ul><li><div>Manage taxation-related functions within the organisation</div><ul><li>Articulate to management all relevant tax issues to minimise the organisation's tax liabilities</li><li>Assess the chargeable gains and losses of the organisation, as well as capital gain tax liabilities</li><li>Ensure there is a common understanding of the need for ethical and professional approaches in dealing with tax-related issues</li><li>Resolve tax-related issues with external tax experts</li><li>Supervise the calculation of taxable income and income tax liabilities of the organisation</li></ul></li></ul><ul><li><div>Manage strategic planning initiatives</div><ul><li>Determine and apply marginal and absorption standard costing concepts to calculate costs variances and profit variances</li><li>Identify and calculate both financial and non-financial performance measurements for reporting on the organisation's performance</li><li>Identify and understand the financing needs of the organisation</li><li>Interpret, investigate and report to management on variances, as well as develop a full understanding of the inter-relationships between variances</li><li>Oversee the preparation of the organisation's budget</li></ul></li></ul><ul><li><div>Support internal and external audit activities</div><ul><li>Implement policies and procedures with emphasis on internal controls to prevent possible fraud and errors</li><li>Plan and coordinate the annual financial audit process</li><li>Resolve issues and deficiencies arising from audit findings</li><li>Respond to internal and external auditors on audit data, variances and audit findings</li></ul></li></ul> ]]>
                </job-description>
                <education-levels>
                    <education-level>
                        <![CDATA[ Bachelor's Degree or equivalent ]]>
                    </education-level>
                </education-levels>
                <employment-types>
                    <employment-type>
                        <![CDATA[ Full Time ]]>
                    </employment-type>
                    <employment-type>
                        <![CDATA[ Contract ]]>
                    </employment-type>
                </employment-types>
                <experience-levels>
                    <experience-level>
                        <![CDATA[ Manager ]]>
                    </experience-level>
                </experience-levels>
                <last-updated-date>
                    <![CDATA[ 2023-11-06 06:32:28 +0800 ]]>
                </last-updated-date>
                <other-information>
                    <![CDATA[ ]]>
                </other-information>
                <company-description>
                    <![CDATA[ <p>A leading general insurer with a local presence of over 100 years, ACME Singapore offers an extensive range of insurance solutions for commercial and personal risk protection, enabling the security and safety of individuals and businesses. ACME Singapore holds an A+/Stable financial rating by Standard & Poor's. A testament to its growing strength and influence, ACME Singapore has garnered numerous awards for delivering digitally innovative and customer-centric solutions. In 2023, 2022 and 2020, ACME Singapore was awarded Insurance Asia Awards Claims Initiative of the Year. ACME is a subsidiary of Mitsui Sumitomo Insurance Co., Ltd, and a member of the MS&AD Insurance Group one of the largest general insurance groups in the world with presence in 50 countries and regions globally, 18 of which are in Asia Pacific including all ASEAN markets as well as in Australia, New Zealand, China, Hong Kong, Taiwan, South Korea and India. Headquartered in Japan, MS&AD is amongst the top non-life insurance groups in the world based on gross revenue.</p> ]]>
                </company-description>
                <years-of-experience>
                    <![CDATA[ 3 ]]>
                </years-of-experience>
            </job>
            <job>
                <city>
                    <![CDATA[ Singapore ]]>
                </city>
                <title>
                    <![CDATA[ Retail Assistant ]]>
                </title>
                <salary>
                    <salary-hidden>
                        <![CDATA[ TRUE ]]>
                    </salary-hidden>
                </salary>
                <skills/>
                <address>
                    <![CDATA[ 7 Temasek Blvd ]]>
                </address>
                <company>
                    <![CDATA[ RecruiterPal (MR) ]]>
                </company>
                <country>
                    <![CDATA[ SG ]]>
                </country>
                <industry>
                    <![CDATA[ Software ]]>
                </industry>
                <job-link>
                    <![CDATA[ http://empdemo4.nemo.recruiterpal.com/career/jobs/a633a ]]>
                </job-link>
                <job-roles>
                    <job-role>
                        <![CDATA[ Others ]]>
                    </job-role>
                </job-roles>
                <vacancies>
                    <![CDATA[ 15 ]]>
                </vacancies>
                <postal-code>
                    <![CDATA[ 038987 ]]>
                </postal-code>
                <posted-date>
                    <![CDATA[ 2023-11-06 01:32:36 +0800 ]]>
                </posted-date>
                <closing-date>
                    <![CDATA[ 2023-12-06 01:32:36 +0800 ]]>
                </closing-date>
                <company-logo>
                    <![CDATA[ http://tmsapi.nemo.recruiterpal.com/v1/external/entity-asset-stream/837zm/entity-type/8kr94/entity-id/8qjdy/file-type/business-profile-logo ]]>
                </company-logo>
                <job-functions>
                    <job-function>
                        <![CDATA[ Retail ]]>
                    </job-function>
                </job-functions>
                <company-ref-id>
                    <![CDATA[ bqwso4 ]]>
                </company-ref-id>
                <posting-ref-id>
                    <![CDATA[ a633a ]]>
                </posting-ref-id>
                <qualifications>
                    <![CDATA[ <p>job qualifications</p> ]]>
                </qualifications>
                <job-description>
                    <![CDATA[ <p>job d</p> ]]>
                </job-description>
                <education-levels>
                    <education-level>
                        <![CDATA[ Others ]]>
                    </education-level>
                </education-levels>
                <employment-types>
                    <employment-type>
                        <![CDATA[ Full Time ]]>
                    </employment-type>
                </employment-types>
                <experience-levels>
                    <experience-level>
                        <![CDATA[ Entry Level ]]>
                    </experience-level>
                </experience-levels>
                <last-updated-date>
                    <![CDATA[ 2023-11-06 06:32:28 +0800 ]]>
                </last-updated-date>
                <other-information>
                    <![CDATA[ ]]>
                </other-information>
                <company-description>
                    <![CDATA[ <p>At RecruiterPal, we see ourselves as change agents; We are driven to make a real difference in the way our clients manage recruitment and talent acquisition efforts. Through the use of our recruitment technology, we have empowered our clients to connect faster, better and smarter with choice candidates, and enabled thousands of people in finding theirchoicecareer.</p><p>If you are intellectually curious bynature,and believe in the power of technology to change peoples' lives, we would love to have a conversation with you.</p> ]]>
                </company-description>
                <years-of-experience>
                    <![CDATA[ 0 ]]>
                </years-of-experience>
            </job>
            <job>
                <city>
                    <![CDATA[ Singapore ]]>
                </city>
                <title>
                    <![CDATA[ Finance Manager ]]>
                </title>
                <salary>
                    <salary-to>
                        <![CDATA[ 10000 ]]>
                    </salary-to>
                    <salary-from>
                        <![CDATA[ 6000 ]]>
                    </salary-from>
                    <salary-hidden>
                        <![CDATA[ FALSE ]]>
                    </salary-hidden>
                    <salary-period>
                        <![CDATA[ Monthly ]]>
                    </salary-period>
                    <salary-currency>
                        <![CDATA[ SGD ]]>
                    </salary-currency>
                </salary>
                <skills>
                    <skill>
                        <![CDATA[ Leadership ]]>
                    </skill>
                    <skill>
                        <![CDATA[ Interpersonal Skills ]]>
                    </skill>
                    <skill>
                        <![CDATA[ Managing Diversity ]]>
                    </skill>
                    <skill>
                        <![CDATA[ Developing People ]]>
                    </skill>
                    <skill>
                        <![CDATA[ Resource Management ]]>
                    </skill>
                </skills>
                <address>
                    <![CDATA[ 18 Boon Lay Way #07-121 Tradehub21 ]]>
                </address>
                <company>
                    <![CDATA[ ACME Singapore Pte Ltd ]]>
                </company>
                <country>
                    <![CDATA[ SG ]]>
                </country>
                <industry>
                    <![CDATA[ Banking & Financial Services ]]>
                </industry>
                <job-link>
                    <![CDATA[ http://empdemo.nemo.recruiterpal.com/career/jobs/jvkkv ]]>
                </job-link>
                <job-roles>
                    <job-role>
                        <![CDATA[ Corporate Finance - Management ]]>
                    </job-role>
                </job-roles>
                <vacancies>
                    <![CDATA[ 1 ]]>
                </vacancies>
                <postal-code>
                    <![CDATA[ 609966 ]]>
                </postal-code>
                <posted-date>
                    <![CDATA[ 2023-11-06 01:32:36 +0800 ]]>
                </posted-date>
                <closing-date>
                    <![CDATA[ 2023-12-06 01:32:36 +0800 ]]>
                </closing-date>
                <company-logo>
                    <![CDATA[ http://tmsapi.nemo.recruiterpal.com/v1/external/entity-asset-stream/837zm/entity-type/8kr94/entity-id/8dewm/file-type/business-profile-logo ]]>
                </company-logo>
                <job-functions>
                    <job-function>
                        <![CDATA[ Corporate Finance ]]>
                    </job-function>
                </job-functions>
                <company-ref-id>
                    <![CDATA[ qj20rw ]]>
                </company-ref-id>
                <posting-ref-id>
                    <![CDATA[ jvkkv ]]>
                </posting-ref-id>
                <qualifications>
                    <![CDATA[ <p>- qualifications</p> ]]>
                </qualifications>
                <job-description>
                    <![CDATA[ <p>The Finance Manager (FM) is the lead finance business partner for the organisation and has responsibilities covering all aspects of financial management, performance management, financial accounting, budgeting and corporate reporting. He/She reports to the Financial Controller. He/She must have sound technical as well as management skills and be able to lead a team consisting of finance professionals with varied, in-depth or niche technical knowledge and abilities. He/She consolidates their work and ensuring its quality and accuracy, especially for reporting purposes.<br><br>The FM is expected to provide sound financial advice and counsel (on working capital, financing or the financial position of the business) to the Financial Controller as well as the organisation's senior management and leadership team by synthesising internal and external data and studying the economic environment. He/She often has a key role in implementing best practices in order to identify and manage all financial and business risks and to meet the organisation's desired business and fiscal goals. He/She is expected to have a firm grasp of economic/business trends and to implement work improvement projects that are geared towards quality, compliance and efficiency in finance.</p><ul><li><div>Manage the organisation's management accounting and budgeting functions</div><ul><li>Adopt and promote Corporate Social Responsibility (CSR) reporting and its assurance using emerging frameworks to move towards an integrated reporting model combining financial and non-financial information</li><li>Evaluate current developments, such as sustainability rating systems, new frameworks and their potential impact on performance measurement and reporting</li><li>Maintain banking relationships for accounts for day-to-day transactions as well as investments</li><li>Prepare for the use and implementation of integrated reporting</li></ul></li></ul><ul><li><div>Drive the use and integration of information technology within the organisation's finance function</div><ul><li>Adopt cloud computing for the business</li><li>Ensure the appropriate set up of accounting rules in the organisation's financial system</li><li>Evaluate the effectiveness of the organisation's financial system and determine any areas of improvement</li><li>Identify and adopt business intelligence tools to analyse financial data and information</li><li>Use data mining and new analytical methodologies</li><li>Use management information systems strategically for effective management and control of the business</li></ul></li></ul><ul><li><div>Support the organisation as a business partner</div><ul><li>Advise management on the organisation's exposure to risks and the involvement of financial institutions, money market instruments and treasury management functions where applicable</li><li>Analyse and assess the impact of investment decisions on the financial position of the organisation</li><li>Analyse current market trends and provide strategic input to shape the organisation's key financial decisions</li><li>Analyse, compile and present management information for managerial decision making</li><li>Apply appropriate appraisal techniques and consideration for taxation, inflation and risk in investment decisions</li><li>Review the valuation of business and financial assets using different models</li></ul></li></ul><ul><li><div>Manage the organisation's financial accounting and corporate reporting functions</div><ul><li>Analyse the financial performance and position of the organisation and develop suitable accounting policies to meet reporting requirements</li><li>Apply professional judgement to identify accounting treatments adopted in financial statements and assess their suitability and acceptability</li><li>Appraise the financial performance and position of entities</li><li>Calculate accounting ratios relating to profitability, liquidity, efficiency and position</li><li>Develop accounting policies that meet reporting requirements and align with business models</li><li>Evaluate the various valuation models used by standard setters</li><li>Manage a documented system of accounting policies and procedures</li><li>Monitor changes and emerging trends in accounting standards and regulation</li><li>Provide financial leadership and strategic thinking to support sustainable value-creation</li><li>Supervise and review the preparation of consolidated financial statements, business activity reports and forecasts for management and external stakeholders</li></ul></li></ul><ul><li><div>Manage taxation-related functions within the organisation</div><ul><li>Articulate to management all relevant tax issues to minimise the organisation's tax liabilities</li><li>Assess the chargeable gains and losses of the organisation, as well as capital gain tax liabilities</li><li>Ensure there is a common understanding of the need for ethical and professional approaches in dealing with tax-related issues</li><li>Resolve tax-related issues with external tax experts</li><li>Supervise the calculation of taxable income and income tax liabilities of the organisation</li></ul></li></ul><ul><li><div>Manage strategic planning initiatives</div><ul><li>Determine and apply marginal and absorption standard costing concepts to calculate costs variances and profit variances</li><li>Identify and calculate both financial and non-financial performance measurements for reporting on the organisation's performance</li><li>Identify and understand the financing needs of the organisation</li><li>Interpret, investigate and report to management on variances, as well as develop a full understanding of the inter-relationships between variances</li><li>Oversee the preparation of the organisation's budget</li></ul></li></ul><ul><li><div>Support internal and external audit activities</div><ul><li>Implement policies and procedures with emphasis on internal controls to prevent possible fraud and errors</li><li>Plan and coordinate the annual financial audit process</li><li>Resolve issues and deficiencies arising from audit findings</li><li>Respond to internal and external auditors on audit data, variances and audit findings</li></ul></li></ul> ]]>
                </job-description>
                <education-levels>
                    <education-level>
                        <![CDATA[ Bachelor's Degree or equivalent ]]>
                    </education-level>
                </education-levels>
                <employment-types>
                    <employment-type>
                        <![CDATA[ Full Time ]]>
                    </employment-type>
                    <employment-type>
                        <![CDATA[ Contract ]]>
                    </employment-type>
                </employment-types>
                <experience-levels>
                    <experience-level>
                        <![CDATA[ Manager ]]>
                    </experience-level>
                </experience-levels>
                <last-updated-date>
                    <![CDATA[ 2023-11-06 06:32:28 +0800 ]]>
                </last-updated-date>
                <other-information>
                    <![CDATA[ ]]>
                </other-information>
                <company-description>
                    <![CDATA[ <p>A leading general insurer with a local presence of over 100 years, ACME Singapore offers an extensive range of insurance solutions for commercial and personal risk protection, enabling the security and safety of individuals and businesses. ACME Singapore holds an A+/Stable financial rating by Standard & Poor's. A testament to its growing strength and influence, ACME Singapore has garnered numerous awards for delivering digitally innovative and customer-centric solutions. In 2023, 2022 and 2020, ACME Singapore was awarded Insurance Asia Awards Claims Initiative of the Year. ACME is a subsidiary of Mitsui Sumitomo Insurance Co., Ltd, and a member of the MS&AD Insurance Group one of the largest general insurance groups in the world with presence in 50 countries and regions globally, 18 of which are in Asia Pacific including all ASEAN markets as well as in Australia, New Zealand, China, Hong Kong, Taiwan, South Korea and India. Headquartered in Japan, MS&AD is amongst the top non-life insurance groups in the world based on gross revenue.</p> ]]>
                </company-description>
                <years-of-experience>
                    <![CDATA[ 2 ]]>
                </years-of-experience>
            </job>
            <job>
                <city>
                    <![CDATA[ Singapore ]]>
                </city>
                <title>
                    <![CDATA[ Retail Assistant ]]>
                </title>
                <salary>
                    <salary-hidden>
                        <![CDATA[ TRUE ]]>
                    </salary-hidden>
                </salary>
                <skills/>
                <address>
                    <![CDATA[ 7 Temasek Blvd ]]>
                </address>
                <company>
                    <![CDATA[ RecruiterPal (MR) ]]>
                </company>
                <country>
                    <![CDATA[ SG ]]>
                </country>
                <industry>
                    <![CDATA[ Software ]]>
                </industry>
                <job-link>
                    <![CDATA[ http://empdemo4.nemo.recruiterpal.com/career/jobs/weqqn ]]>
                </job-link>
                <job-roles>
                    <job-role>
                        <![CDATA[ Retail - Sales Executive ]]>
                    </job-role>
                </job-roles>
                <vacancies>
                    <![CDATA[ 15 ]]>
                </vacancies>
                <postal-code>
                    <![CDATA[ 038987 ]]>
                </postal-code>
                <posted-date>
                    <![CDATA[ 2023-11-06 01:32:36 +0800 ]]>
                </posted-date>
                <closing-date>
                    <![CDATA[ 2023-12-06 01:32:36 +0800 ]]>
                </closing-date>
                <company-logo>
                    <![CDATA[ http://tmsapi.nemo.recruiterpal.com/v1/external/entity-asset-stream/837zm/entity-type/8kr94/entity-id/8qjdy/file-type/business-profile-logo ]]>
                </company-logo>
                <job-functions>
                    <job-function>
                        <![CDATA[ Retail ]]>
                    </job-function>
                </job-functions>
                <company-ref-id>
                    <![CDATA[ bqwso4 ]]>
                </company-ref-id>
                <posting-ref-id>
                    <![CDATA[ weqqn ]]>
                </posting-ref-id>
                <qualifications>
                    <![CDATA[ <p>- Jobqualifications</p> ]]>
                </qualifications>
                <job-description>
                    <![CDATA[ <p>- Job description</p> ]]>
                </job-description>
                <education-levels>
                    <education-level>
                        <![CDATA[ Diploma ]]>
                    </education-level>
                </education-levels>
                <employment-types>
                    <employment-type>
                        <![CDATA[ Full Time ]]>
                    </employment-type>
                </employment-types>
                <experience-levels>
                    <experience-level>
                        <![CDATA[ Non-Executive ]]>
                    </experience-level>
                </experience-levels>
                <last-updated-date>
                    <![CDATA[ 2023-11-06 06:32:28 +0800 ]]>
                </last-updated-date>
                <other-information>
                    <![CDATA[ ]]>
                </other-information>
                <company-description>
                    <![CDATA[ <p>At RecruiterPal, we see ourselves as change agents; We are driven to make a real difference in the way our clients manage recruitment and talent acquisition efforts. Through the use of our recruitment technology, we have empowered our clients to connect faster, better and smarter with choice candidates, and enabled thousands of people in finding theirchoicecareer.</p><p>If you are intellectually curious bynature,and believe in the power of technology to change peoples' lives, we would love to have a conversation with you.</p> ]]>
                </company-description>
                <years-of-experience>
                    <![CDATA[ 1 ]]>
                </years-of-experience>
            </job>
            <job>
                <city>
                    <![CDATA[ Singapore ]]>
                </city>
                <title>
                    <![CDATA[ Application Development and Support ]]>
                </title>
                <salary>
                    <salary-to>
                        <![CDATA[ 3200 ]]>
                    </salary-to>
                    <salary-from>
                        <![CDATA[ 2800 ]]>
                    </salary-from>
                    <salary-hidden>
                        <![CDATA[ FALSE ]]>
                    </salary-hidden>
                    <salary-period>
                        <![CDATA[ Monthly ]]>
                    </salary-period>
                    <salary-currency>
                        <![CDATA[ SGD ]]>
                    </salary-currency>
                </salary>
                <skills>
                    <skill>
                        <![CDATA[ WebService ]]>
                    </skill>
                    <skill>
                        <![CDATA[ HTML ]]>
                    </skill>
                    <skill>
                        <![CDATA[ JAVASCRIPT ]]>
                    </skill>
                </skills>
                <address>
                    <![CDATA[ 7 Temasek Blvd ]]>
                </address>
                <company>
                    <![CDATA[ RecruiterPal (MR) ]]>
                </company>
                <country>
                    <![CDATA[ SG ]]>
                </country>
                <industry>
                    <![CDATA[ Software ]]>
                </industry>
                <job-link>
                    <![CDATA[ http://empdemo4.nemo.recruiterpal.com/career/jobs/ov992 ]]>
                </job-link>
                <job-roles>
                    <job-role>
                        <![CDATA[ Senior Software Developer ]]>
                    </job-role>
                </job-roles>
                <vacancies>
                    <![CDATA[ 5 ]]>
                </vacancies>
                <postal-code>
                    <![CDATA[ 038987 ]]>
                </postal-code>
                <posted-date>
                    <![CDATA[ 2023-11-06 01:32:36 +0800 ]]>
                </posted-date>
                <closing-date>
                    <![CDATA[ 2023-12-06 01:32:36 +0800 ]]>
                </closing-date>
                <company-logo>
                    <![CDATA[ http://tmsapi.nemo.recruiterpal.com/v1/external/entity-asset-stream/837zm/entity-type/8kr94/entity-id/8qjdy/file-type/business-profile-logo ]]>
                </company-logo>
                <job-functions>
                    <job-function>
                        <![CDATA[ Software/Development ]]>
                    </job-function>
                </job-functions>
                <company-ref-id>
                    <![CDATA[ bqwso4 ]]>
                </company-ref-id>
                <posting-ref-id>
                    <![CDATA[ ov992 ]]>
                </posting-ref-id>
                <qualifications>
                    <![CDATA[ <ul><li>Possess a Diploma or greater in a technical field such as Computer Science, Computer Engineering, or relevant field preferred</li><li>3+ years of relevant IT experience (Production Support, SDLC Waterfall / Agile) supporting and building web applications</li><li>Proficient in MS SQL Server, Transact SQL, stored procedures, triggers, DTS package</li><li>Proficient in SSRS and SSIS development</li><li>Familiarity with object-oriented programming and solid design principles</li><li>Experience developing/ supporting using JavaScript, Webservice, XML, JSON, HTML</li><li>Extensive knowledge of C#, ASP.NET using Visual Studio, MVC and Entity Framework</li><li>Good understanding of Web Services protocols such as RESTful, SOAP and API design for extensibility and portability</li><li>Excellent verbal and written communication skills</li><li>Self-starter that can work well in a team environment</li><li>Proactive issue resolution with a positive attitude</li><li>Ability to adapt and respond in a rapidly evolving business environment</li></ul> ]]>
                </qualifications>
                <job-description>
                    <![CDATA[ <ul><li>Develop SSRS Reports and dashboards using Microsoft Reporting Services platform (SSRS), Microsoft SQL, MS Excel, pivot tables and other tools Analysis Services Cubes and relational databases</li><li>Maintain systems by identifying and correcting software defects</li><li>Participate in requirement analysis and definition</li><li>Support applications using software development methodologies including structured programming, documentation, design</li><li>Work as part of development team to solve problems and develop projects in a fast-paced environment</li><li>Demonstrate a basic degree of creativity and problem-solving skills</li><li>Liaison between IT and the business defining business requirements / IT demand and delivering technology to enable and meet business strategy</li><li>Provide application production support to business units</li><li>Perform design of data models and development of extraction, loading and transformation (ETL) rules based on user requirements</li><li>Provide user support during user acceptance test and post implementation</li></ul> ]]>
                </job-description>
                <education-levels>
                    <education-level>
                        <![CDATA[ Diploma ]]>
                    </education-level>
                    <education-level>
                        <![CDATA[ Bachelor's Degree or equivalent ]]>
                    </education-level>
                    <education-level>
                        <![CDATA[ Graduate Diploma ]]>
                    </education-level>
                </education-levels>
                <employment-types>
                    <employment-type>
                        <![CDATA[ Full Time ]]>
                    </employment-type>
                </employment-types>
                <experience-levels>
                    <experience-level>
                        <![CDATA[ Executive ]]>
                    </experience-level>
                </experience-levels>
                <last-updated-date>
                    <![CDATA[ 2023-11-06 06:32:28 +0800 ]]>
                </last-updated-date>
                <other-information>
                    <![CDATA[ ]]>
                </other-information>
                <company-description>
                    <![CDATA[ <p>Founded as a bakery brand in Singapore in 2000, BreadTalk Group has rapidly expanded to become an award-winning F&B Group that has established its mark on the world stage with its bakery, restaurant and food atrium footprints. With over 900 retail stores spread across 15 markets in Asia, Middle East and United Kingdom, its brand portfolio comprises direct owned brands such as BreadTalk, Toast Box, Food Republic, Food Junction, Bread Society, S Ramen, Thye Moh Chan, The Icing Room and partner brands such as Din Tai Fung, Song Fa Bak Kut Teh, and Wu Pao Chun Bakery.</p> ]]>
                </company-description>
                <years-of-experience>
                    <![CDATA[ 3 ]]>
                </years-of-experience>
            </job>
            <job>
                <city>
                    <![CDATA[ Singapore ]]>
                </city>
                <title>
                    <![CDATA[ Accounts Executive ]]>
                </title>
                <salary>
                    <salary-to>
                        <![CDATA[ 3200 ]]>
                    </salary-to>
                    <salary-from>
                        <![CDATA[ 2800 ]]>
                    </salary-from>
                    <salary-hidden>
                        <![CDATA[ FALSE ]]>
                    </salary-hidden>
                    <salary-period>
                        <![CDATA[ Monthly ]]>
                    </salary-period>
                    <salary-currency>
                        <![CDATA[ SGD ]]>
                    </salary-currency>
                </salary>
                <skills>
                    <skill>
                        <![CDATA[ Microsoft Excel ]]>
                    </skill>
                </skills>
                <address>
                    <![CDATA[ 7 Temasek Blvd ]]>
                </address>
                <company>
                    <![CDATA[ RecruiterPal (MR) ]]>
                </company>
                <country>
                    <![CDATA[ SG ]]>
                </country>
                <industry>
                    <![CDATA[ Software ]]>
                </industry>
                <job-link>
                    <![CDATA[ http://empdemo4.nemo.recruiterpal.com/career/jobs/a633e ]]>
                </job-link>
                <job-roles>
                    <job-role>
                        <![CDATA[ Basic Accounting/Bookkeeping/Accounts Executive ]]>
                    </job-role>
                    <job-role>
                        <![CDATA[ Accounts Specialist ]]>
                    </job-role>
                </job-roles>
                <vacancies>
                    <![CDATA[ 1 ]]>
                </vacancies>
                <postal-code>
                    <![CDATA[ 038987 ]]>
                </postal-code>
                <posted-date>
                    <![CDATA[ 2023-11-06 01:32:36 +0800 ]]>
                </posted-date>
                <closing-date>
                    <![CDATA[ 2023-12-06 01:32:36 +0800 ]]>
                </closing-date>
                <company-logo>
                    <![CDATA[ http://tmsapi.nemo.recruiterpal.com/v1/external/entity-asset-stream/837zm/entity-type/8kr94/entity-id/8qjdy/file-type/business-profile-logo ]]>
                </company-logo>
                <job-functions>
                    <job-function>
                        <![CDATA[ Accounting ]]>
                    </job-function>
                </job-functions>
                <company-ref-id>
                    <![CDATA[ bqwso4 ]]>
                </company-ref-id>
                <posting-ref-id>
                    <![CDATA[ a633e ]]>
                </posting-ref-id>
                <qualifications>
                    <![CDATA[ <ul><li>Minimum 2 year of experience in related fields</li><li>Degree / Diploma in Accountancy or equivalent professional qualification</li><li>Experience in handling transactions and/or accounts of F&B industry is preferred.</li><li>Proficient in Microsoft Excel.</li><li>Experience in SAP would be an advantage.</li><li>Positive working attitude, meticulous with accuracy & efficiency.</li><li>Able to get along with others and display good team spirit.</li><li>Able to work under pressure and adhere to tight deadlines.</li><li>Written and Spoken English. Additional language ability is advantageous.</li></ul> ]]>
                </qualifications>
                <job-description>
                    <![CDATA[ <ul><li>Ensure timely and accurate recording of invoices in the accounting system.</li><li>Liaise with suppliers and business divisions on any discrepancies in invoices and other supporting documents.</li><li>Review reconciliation of supplier statements.</li><li>Ensure compliance of organisational process/procedures.</li><li>Prepare intercompany schedules and GST reports for submission.</li><li>Work as a team within the department to ensure all documents are properly collated for timely submission.</li><li>Assist in ad-hoc projects assigned from time to time.</li></ul> ]]>
                </job-description>
                <education-levels>
                    <education-level>
                        <![CDATA[ Diploma ]]>
                    </education-level>
                    <education-level>
                        <![CDATA[ Bachelor's Degree or equivalent ]]>
                    </education-level>
                </education-levels>
                <employment-types>
                    <employment-type>
                        <![CDATA[ Full Time ]]>
                    </employment-type>
                </employment-types>
                <experience-levels>
                    <experience-level>
                        <![CDATA[ Executive ]]>
                    </experience-level>
                </experience-levels>
                <last-updated-date>
                    <![CDATA[ 2023-11-06 06:32:28 +0800 ]]>
                </last-updated-date>
                <other-information>
                    <![CDATA[ ]]>
                </other-information>
                <company-description>
                    <![CDATA[ <p>Founded as a bakery brand in Singapore in 2000, BreadTalk Group has rapidly expanded to become an award-winning F&B Group that has established its mark on the world stage with its bakery, restaurant and food atrium footprints. With over 900 retail stores spread across 15 markets in Asia, Middle East and United Kingdom, its brand portfolio comprises direct owned brands such as BreadTalk, Toast Box, Food Republic, Food Junction, Bread Society, S Ramen, Thye Moh Chan, The Icing Room and partner brands such as Din Tai Fung, Song Fa Bak Kut Teh, and Wu Pao Chun Bakery.</p> ]]>
                </company-description>
                <years-of-experience>
                    <![CDATA[ 2 ]]>
                </years-of-experience>
            </job>
            <job>
                <city>
                    <![CDATA[ Singapore ]]>
                </city>
                <title>
                    <![CDATA[ Finance Manager ]]>
                </title>
                <salary>
                    <salary-to>
                        <![CDATA[ 10000 ]]>
                    </salary-to>
                    <salary-from>
                        <![CDATA[ 6000 ]]>
                    </salary-from>
                    <salary-hidden>
                        <![CDATA[ FALSE ]]>
                    </salary-hidden>
                    <salary-period>
                        <![CDATA[ Monthly ]]>
                    </salary-period>
                    <salary-currency>
                        <![CDATA[ SGD ]]>
                    </salary-currency>
                </salary>
                <skills>
                    <skill>
                        <![CDATA[ Leadership ]]>
                    </skill>
                    <skill>
                        <![CDATA[ Interpersonal Skills ]]>
                    </skill>
                    <skill>
                        <![CDATA[ Managing Diversity ]]>
                    </skill>
                    <skill>
                        <![CDATA[ Developing People ]]>
                    </skill>
                    <skill>
                        <![CDATA[ Resource Management ]]>
                    </skill>
                </skills>
                <address>
                    <![CDATA[ 18 Boon Lay Way #07-121 Tradehub21 ]]>
                </address>
                <company>
                    <![CDATA[ ACME Singapore Pte Ltd ]]>
                </company>
                <country>
                    <![CDATA[ SG ]]>
                </country>
                <industry>
                    <![CDATA[ Banking & Financial Services ]]>
                </industry>
                <job-link>
                    <![CDATA[ http://empdemo.nemo.recruiterpal.com/career/jobs/db55w ]]>
                </job-link>
                <job-roles>
                    <job-role>
                        <![CDATA[ Corporate Finance - Management ]]>
                    </job-role>
                </job-roles>
                <vacancies>
                    <![CDATA[ 1 ]]>
                </vacancies>
                <postal-code>
                    <![CDATA[ 609966 ]]>
                </postal-code>
                <posted-date>
                    <![CDATA[ 2023-11-06 01:32:36 +0800 ]]>
                </posted-date>
                <closing-date>
                    <![CDATA[ 2023-12-06 01:32:36 +0800 ]]>
                </closing-date>
                <company-logo>
                    <![CDATA[ http://tmsapi.nemo.recruiterpal.com/v1/external/entity-asset-stream/837zm/entity-type/8kr94/entity-id/8dewm/file-type/business-profile-logo ]]>
                </company-logo>
                <job-functions>
                    <job-function>
                        <![CDATA[ Corporate Finance ]]>
                    </job-function>
                </job-functions>
                <company-ref-id>
                    <![CDATA[ qj20rw ]]>
                </company-ref-id>
                <posting-ref-id>
                    <![CDATA[ db55w ]]>
                </posting-ref-id>
                <qualifications>
                    <![CDATA[ <ul><li>Diploma</li></ul> ]]>
                </qualifications>
                <job-description>
                    <![CDATA[ <p>The Finance Manager (FM) is the lead finance business partner for the organisation and has responsibilities covering all aspects of financial management, performance management, financial accounting, budgeting and corporate reporting. He/She reports to the Financial Controller. He/She must have sound technical as well as management skills and be able to lead a team consisting of finance professionals with varied, in-depth or niche technical knowledge and abilities. He/She consolidates their work and ensuring its quality and accuracy, especially for reporting purposes.<br><br>The FM is expected to provide sound financial advice and counsel (on working capital, financing or the financial position of the business) to the Financial Controller as well as the organisation's senior management and leadership team by synthesising internal and external data and studying the economic environment. He/She often has a key role in implementing best practices in order to identify and manage all financial and business risks and to meet the organisation's desired business and fiscal goals. He/She is expected to have a firm grasp of economic/business trends and to implement work improvement projects that are geared towards quality, compliance and efficiency in finance.</p><ul><li><div>Manage the organisation's management accounting and budgeting functions</div><ul><li>Adopt and promote Corporate Social Responsibility (CSR) reporting and its assurance using emerging frameworks to move towards an integrated reporting model combining financial and non-financial information</li><li>Evaluate current developments, such as sustainability rating systems, new frameworks and their potential impact on performance measurement and reporting</li><li>Maintain banking relationships for accounts for day-to-day transactions as well as investments</li><li>Prepare for the use and implementation of integrated reporting</li></ul></li></ul><ul><li><div>Drive the use and integration of information technology within the organisation's finance function</div><ul><li>Adopt cloud computing for the business</li><li>Ensure the appropriate set up of accounting rules in the organisation's financial system</li><li>Evaluate the effectiveness of the organisation's financial system and determine any areas of improvement</li><li>Identify and adopt business intelligence tools to analyse financial data and information</li><li>Use data mining and new analytical methodologies</li><li>Use management information systems strategically for effective management and control of the business</li></ul></li></ul><ul><li><div>Support the organisation as a business partner</div><ul><li>Advise management on the organisation's exposure to risks and the involvement of financial institutions, money market instruments and treasury management functions where applicable</li><li>Analyse and assess the impact of investment decisions on the financial position of the organisation</li><li>Analyse current market trends and provide strategic input to shape the organisation's key financial decisions</li><li>Analyse, compile and present management information for managerial decision making</li><li>Apply appropriate appraisal techniques and consideration for taxation, inflation and risk in investment decisions</li><li>Review the valuation of business and financial assets using different models</li></ul></li></ul><ul><li><div>Manage the organisation's financial accounting and corporate reporting functions</div><ul><li>Analyse the financial performance and position of the organisation and develop suitable accounting policies to meet reporting requirements</li><li>Apply professional judgement to identify accounting treatments adopted in financial statements and assess their suitability and acceptability</li><li>Appraise the financial performance and position of entities</li><li>Calculate accounting ratios relating to profitability, liquidity, efficiency and position</li><li>Develop accounting policies that meet reporting requirements and align with business models</li><li>Evaluate the various valuation models used by standard setters</li><li>Manage a documented system of accounting policies and procedures</li><li>Monitor changes and emerging trends in accounting standards and regulation</li><li>Provide financial leadership and strategic thinking to support sustainable value-creation</li><li>Supervise and review the preparation of consolidated financial statements, business activity reports and forecasts for management and external stakeholders</li></ul></li></ul><ul><li><div>Manage taxation-related functions within the organisation</div><ul><li>Articulate to management all relevant tax issues to minimise the organisation's tax liabilities</li><li>Assess the chargeable gains and losses of the organisation, as well as capital gain tax liabilities</li><li>Ensure there is a common understanding of the need for ethical and professional approaches in dealing with tax-related issues</li><li>Resolve tax-related issues with external tax experts</li><li>Supervise the calculation of taxable income and income tax liabilities of the organisation</li></ul></li></ul><ul><li><div>Manage strategic planning initiatives</div><ul><li>Determine and apply marginal and absorption standard costing concepts to calculate costs variances and profit variances</li><li>Identify and calculate both financial and non-financial performance measurements for reporting on the organisation's performance</li><li>Identify and understand the financing needs of the organisation</li><li>Interpret, investigate and report to management on variances, as well as develop a full understanding of the inter-relationships between variances</li><li>Oversee the preparation of the organisation's budget</li></ul></li></ul><ul><li><div>Support internal and external audit activities</div><ul><li>Implement policies and procedures with emphasis on internal controls to prevent possible fraud and errors</li><li>Plan and coordinate the annual financial audit process</li><li>Resolve issues and deficiencies arising from audit findings</li><li>Respond to internal and external auditors on audit data, variances and audit findings</li></ul></li></ul> ]]>
                </job-description>
                <education-levels>
                    <education-level>
                        <![CDATA[ Bachelor's Degree or equivalent ]]>
                    </education-level>
                </education-levels>
                <employment-types>
                    <employment-type>
                        <![CDATA[ Full Time ]]>
                    </employment-type>
                    <employment-type>
                        <![CDATA[ Contract ]]>
                    </employment-type>
                </employment-types>
                <experience-levels>
                    <experience-level>
                        <![CDATA[ Manager ]]>
                    </experience-level>
                </experience-levels>
                <last-updated-date>
                    <![CDATA[ 2023-11-06 06:32:28 +0800 ]]>
                </last-updated-date>
                <other-information>
                    <![CDATA[ ]]>
                </other-information>
                <company-description>
                    <![CDATA[ <p>Founded in 2000, the BreadTalk Group Pte Ltd has rapidly expanded to become a distinctive household brand owner that has established its mark on the world stage with its bakery, restaurant and food atrium footprints. Today, with over 900 outlets in 15 international markets, the BreadTalk Group produces culinary magic for everyday recipes that you savour, uniting people with good taste around the world.</p> ]]>
                </company-description>
                <years-of-experience>
                    <![CDATA[ 4 ]]>
                </years-of-experience>
            </job>
            <job>
                <city>
                    <![CDATA[ Singapore ]]>
                </city>
                <title>
                    <![CDATA[ Cashier ]]>
                </title>
                <salary>
                    <salary-hidden>
                        <![CDATA[ TRUE ]]>
                    </salary-hidden>
                </salary>
                <skills/>
                <address>
                    <![CDATA[ 7 Temasek Blvd ]]>
                </address>
                <company>
                    <![CDATA[ RecruiterPal (MR) ]]>
                </company>
                <country>
                    <![CDATA[ SG ]]>
                </country>
                <industry>
                    <![CDATA[ Software ]]>
                </industry>
                <job-link>
                    <![CDATA[ http://empdemo4.nemo.recruiterpal.com/career/jobs/3r772 ]]>
                </job-link>
                <job-roles>
                    <job-role>
                        <![CDATA[ Service Crew ]]>
                    </job-role>
                </job-roles>
                <vacancies>
                    <![CDATA[ 5 ]]>
                </vacancies>
                <postal-code>
                    <![CDATA[ 038987 ]]>
                </postal-code>
                <posted-date>
                    <![CDATA[ 2023-11-06 01:32:37 +0800 ]]>
                </posted-date>
                <closing-date>
                    <![CDATA[ 2023-12-06 01:32:37 +0800 ]]>
                </closing-date>
                <company-logo>
                    <![CDATA[ http://tmsapi.nemo.recruiterpal.com/v1/external/entity-asset-stream/837zm/entity-type/8kr94/entity-id/8qjdy/file-type/business-profile-logo ]]>
                </company-logo>
                <job-functions>
                    <job-function>
                        <![CDATA[ Restaurant / F&B ]]>
                    </job-function>
                </job-functions>
                <company-ref-id>
                    <![CDATA[ bqwso4 ]]>
                </company-ref-id>
                <posting-ref-id>
                    <![CDATA[ 3r772 ]]>
                </posting-ref-id>
                <qualifications>
                    <![CDATA[ <p> Positive attitude with a great personality.</p><p> Great communication skills.</p><p> Great personal hygiene and well-groomed at all times.</p><p> Good knowledge of food and beverage, retail and the art industries, is a plus.</p><p> A great team player.</p><p> Ability to multi-task and work in a fast-paced environment while delivering orders in a timely manner.</p><p> Ability to work under pressure with all team members.</p><p> Experience with providing excellent customer service in a fast-paced environment.</p><p> Ability to perform high-quality work when unsupervised.</p><p> Ability to handle money accurately and operate a POS.</p><p> Post-Secondary education qualifications</p> ]]>
                </qualifications>
                <job-description>
                    <![CDATA[ <p>Responsibilities:</p><p> Takes menu orders accurately and with a positive attitude.</p><p> Enters orders into POS for successful preparation and delivery of menu items to customers.</p><p> Engage with customers on any questions about the menus, F&B and retail products, ongoing exhibition and events.</p><p> Good knowledge of menu with the ability to make considered suggestions.</p><p> Ensure all customers are enjoying their meals and be proactive to correct any problems or complaints.</p><p> Communicates orders with culinary, bar and beverage teams.</p><p> Preparation of selected food, alcoholic & non-alcoholic beverages according to the brands quality and standards when necessary.</p><p> Seat customers where and when necessary.</p><p> Collect payments at tables and/or at service counters.</p><p> Prepare checks that itemize meals, tallies total costs and taxes correctly.</p><p> Maintain excellent hygiene and safety requirements in the multi-concept venue at all times.</p><p> Supports management on duties assigned when<span> necessary.</span></p> ]]>
                </job-description>
                <education-levels>
                    <education-level>
                        <![CDATA[ Diploma ]]>
                    </education-level>
                    <education-level>
                        <![CDATA[ Bachelor's Degree or equivalent ]]>
                    </education-level>
                </education-levels>
                <employment-types>
                    <employment-type>
                        <![CDATA[ Temporary ]]>
                    </employment-type>
                </employment-types>
                <experience-levels>
                    <experience-level>
                        <![CDATA[ Non-Executive ]]>
                    </experience-level>
                </experience-levels>
                <last-updated-date>
                    <![CDATA[ 2023-11-06 06:32:28 +0800 ]]>
                </last-updated-date>
                <other-information>
                    <![CDATA[ <p>Part Time - Morning Shift (7:00am to 2:00pm) | Afternoon Shift- (2:00pm to 10:00pm)<br><br> Full time - 6 days work week.</p> ]]>
                </other-information>
                <company-description>
                    <![CDATA[ <p>Founded in 2000, the BreadTalk Group Pte Ltd has rapidly expanded to become a distinctive household brand owner that has established its mark on the world stage with its bakery, restaurant and food atrium footprints. Today, with over 900 outlets in 15 international markets, the BreadTalk Group produces culinary magic for everyday recipes that you savour, uniting people with good taste around the world.</p><p>With a global staff strength of more than 5,000 employees, the Group operates nearly 800 bakeries, 31 Din Tai Fung restaurants in Singapore, Thailand and the United Kingdom and close to 60 award winning Food Republic outlets in China, Singapore, China-Hong Kong, Malaysia, China-Taiwan, Thailand and Cambodia as well as 14 Food Junction outlets in Singapore and Malaysia under the Food Atrium division.</p><p></p> ]]>
                </company-description>
                <years-of-experience>
                    <![CDATA[ 0 ]]>
                </years-of-experience>
            </job>
            <job>
                <city>
                    <![CDATA[ Singapore ]]>
                </city>
                <title>
                    <![CDATA[ Night Cashier ]]>
                </title>
                <salary>
                    <salary-hidden>
                        <![CDATA[ TRUE ]]>
                    </salary-hidden>
                </salary>
                <skills/>
                <address>
                    <![CDATA[ 18 Boon Lay Way #07-121 Tradehub21 ]]>
                </address>
                <company>
                    <![CDATA[ ACME Singapore Pte Ltd ]]>
                </company>
                <country>
                    <![CDATA[ SG ]]>
                </country>
                <industry>
                    <![CDATA[ Banking & Financial Services ]]>
                </industry>
                <job-link>
                    <![CDATA[ http://empdemo.nemo.recruiterpal.com/career/jobs/q9jj5 ]]>
                </job-link>
                <job-roles>
                    <job-role>
                        <![CDATA[ Cashier ]]>
                    </job-role>
                </job-roles>
                <vacancies>
                    <![CDATA[ 5 ]]>
                </vacancies>
                <postal-code>
                    <![CDATA[ 609966 ]]>
                </postal-code>
                <posted-date>
                    <![CDATA[ 2023-11-06 01:32:37 +0800 ]]>
                </posted-date>
                <closing-date>
                    <![CDATA[ 2023-12-06 01:32:37 +0800 ]]>
                </closing-date>
                <company-logo>
                    <![CDATA[ http://tmsapi.nemo.recruiterpal.com/v1/external/entity-asset-stream/837zm/entity-type/8kr94/entity-id/8dewm/file-type/business-profile-logo ]]>
                </company-logo>
                <job-functions>
                    <job-function>
                        <![CDATA[ Retail ]]>
                    </job-function>
                </job-functions>
                <company-ref-id>
                    <![CDATA[ qj20rw ]]>
                </company-ref-id>
                <posting-ref-id>
                    <![CDATA[ q9jj5 ]]>
                </posting-ref-id>
                <qualifications>
                    <![CDATA[ <ul><li>Customer service oriented</li><li>Positive and willingness to learn</li><li>Ability to handle transactions accurately and responsibly</li><li>Good communication skills</li></ul> ]]>
                </qualifications>
                <job-description>
                    <![CDATA[ <ul><li><div>Promote and provide excellent customer service at all times</div></li><li>Maximize sales and profitability through professional handling of promotional sales transactions</li><li>Maintain and monitor optimum and accurate inventory level</li><li>Ensure effective and efficient day-to-day work SOP of store</li><li>Any other adhoc duties as per assigned</li></ul> ]]>
                </job-description>
                <education-levels>
                    <education-level>
                        <![CDATA[ Diploma ]]>
                    </education-level>
                    <education-level>
                        <![CDATA[ Bachelor's Degree or equivalent ]]>
                    </education-level>
                </education-levels>
                <employment-types>
                    <employment-type>
                        <![CDATA[ Temporary ]]>
                    </employment-type>
                </employment-types>
                <experience-levels>
                    <experience-level>
                        <![CDATA[ Non-Executive ]]>
                    </experience-level>
                </experience-levels>
                <last-updated-date>
                    <![CDATA[ 2023-11-06 06:32:28 +0800 ]]>
                </last-updated-date>
                <other-information>
                    <![CDATA[ <div><strong>Benefits:</strong></div><ul><li><div><div>Yearly Bonus</div></div></li><li>Team Member Discount</li><li>Subsidized Medical and Dental Benefits</li><li>Training Opportunities</li><li>Career Advancement</li></ul><div><strong>Working Location:</strong></div><ul><li><div><div>Breadtalk IHQ</div></div></li></ul> ]]>
                </other-information>
                <company-description>
                    <![CDATA[ <p>Founded in 2000, the BreadTalk Group Pte Ltd has rapidly expanded to become a distinctive household brand owner that has established its mark on the world stage with its bakery, restaurant and food atrium footprints. Today, with over 900 outlets in 15 international markets, the BreadTalk Group produces culinary magic for everyday recipes that you savour, uniting people with good taste around the world.</p><p>With a global staff strength of more than 5,000 employees, the Group operates nearly 800 bakeries, 31 Din Tai Fung restaurants in Singapore, Thailand and the United Kingdom and close to 60 award winning Food Republic outlets in China, Singapore, China-Hong Kong, Malaysia, China-Taiwan, Thailand and Cambodia as well as 14 Food Junction outlets in Singapore and Malaysia under the Food Atrium division.</p> ]]>
                </company-description>
                <years-of-experience>
                    <![CDATA[ 1 ]]>
                </years-of-experience>
            </job>
            <job>
                <city>
                    <![CDATA[ Singapore ]]>
                </city>
                <title>
                    <![CDATA[ Finance Manager ]]>
                </title>
                <salary>
                    <salary-hidden>
                        <![CDATA[ TRUE ]]>
                    </salary-hidden>
                </salary>
                <skills>
                    <skill>
                        <![CDATA[ Leadership ]]>
                    </skill>
                    <skill>
                        <![CDATA[ Interpersonal Skills ]]>
                    </skill>
                    <skill>
                        <![CDATA[ Managing Diversity ]]>
                    </skill>
                    <skill>
                        <![CDATA[ Developing People ]]>
                    </skill>
                    <skill>
                        <![CDATA[ Resource Management ]]>
                    </skill>
                </skills>
                <address>
                    <![CDATA[ 18 Boon Lay Way #07-121 Tradehub21 ]]>
                </address>
                <company>
                    <![CDATA[ ACME Singapore Pte Ltd ]]>
                </company>
                <country>
                    <![CDATA[ SG ]]>
                </country>
                <industry>
                    <![CDATA[ Banking & Financial Services ]]>
                </industry>
                <job-link>
                    <![CDATA[ http://empdemo.nemo.recruiterpal.com/career/jobs/6277p ]]>
                </job-link>
                <job-roles>
                    <job-role>
                        <![CDATA[ Corporate Finance - Management ]]>
                    </job-role>
                </job-roles>
                <vacancies>
                    <![CDATA[ 1 ]]>
                </vacancies>
                <postal-code>
                    <![CDATA[ 609966 ]]>
                </postal-code>
                <posted-date>
                    <![CDATA[ 2023-11-06 01:32:37 +0800 ]]>
                </posted-date>
                <closing-date>
                    <![CDATA[ 2023-12-06 01:32:37 +0800 ]]>
                </closing-date>
                <company-logo>
                    <![CDATA[ http://tmsapi.nemo.recruiterpal.com/v1/external/entity-asset-stream/837zm/entity-type/8kr94/entity-id/8dewm/file-type/business-profile-logo ]]>
                </company-logo>
                <job-functions>
                    <job-function>
                        <![CDATA[ Corporate Finance ]]>
                    </job-function>
                </job-functions>
                <company-ref-id>
                    <![CDATA[ qj20rw ]]>
                </company-ref-id>
                <posting-ref-id>
                    <![CDATA[ 6277p ]]>
                </posting-ref-id>
                <qualifications>
                    <![CDATA[ <ul><li>Diploma in associated discipline</li></ul> ]]>
                </qualifications>
                <job-description>
                    <![CDATA[ <p>The Finance Manager (FM) is the lead finance business partner for the organisation and has responsibilities covering all aspects of financial management, performance management, financial accounting, budgeting and corporate reporting. He/She reports to the Financial Controller. He/She must have sound technical as well as management skills and be able to lead a team consisting of finance professionals with varied, in-depth or niche technical knowledge and abilities. He/She consolidates their work and ensuring its quality and accuracy, especially for reporting purposes.<br><br>The FM is expected to provide sound financial advice and counsel (on working capital, financing or the financial position of the business) to the Financial Controller as well as the organisation's senior management and leadership team by synthesising internal and external data and studying the economic environment. He/She often has a key role in implementing best practices in order to identify and manage all financial and business risks and to meet the organisation's desired business and fiscal goals. He/She is expected to have a firm grasp of economic/business trends and to implement work improvement projects that are geared towards quality, compliance and efficiency in finance.</p><ul><li><div>Manage the organisation's management accounting and budgeting functions</div><ul><li>Adopt and promote Corporate Social Responsibility (CSR) reporting and its assurance using emerging frameworks to move towards an integrated reporting model combining financial and non-financial information</li><li>Evaluate current developments, such as sustainability rating systems, new frameworks and their potential impact on performance measurement and reporting</li><li>Maintain banking relationships for accounts for day-to-day transactions as well as investments</li><li>Prepare for the use and implementation of integrated reporting</li></ul></li></ul><ul><li><div>Drive the use and integration of information technology within the organisation's finance function</div><ul><li>Adopt cloud computing for the business</li><li>Ensure the appropriate set up of accounting rules in the organisation's financial system</li><li>Evaluate the effectiveness of the organisation's financial system and determine any areas of improvement</li><li>Identify and adopt business intelligence tools to analyse financial data and information</li><li>Use data mining and new analytical methodologies</li><li>Use management information systems strategically for effective management and control of the business</li></ul></li></ul><ul><li><div>Support the organisation as a business partner</div><ul><li>Advise management on the organisation's exposure to risks and the involvement of financial institutions, money market instruments and treasury management functions where applicable</li><li>Analyse and assess the impact of investment decisions on the financial position of the organisation</li><li>Analyse current market trends and provide strategic input to shape the organisation's key financial decisions</li><li>Analyse, compile and present management information for managerial decision making</li><li>Apply appropriate appraisal techniques and consideration for taxation, inflation and risk in investment decisions</li><li>Review the valuation of business and financial assets using different models</li></ul></li></ul><ul><li><div>Manage the organisation's financial accounting and corporate reporting functions</div><ul><li>Analyse the financial performance and position of the organisation and develop suitable accounting policies to meet reporting requirements</li><li>Apply professional judgement to identify accounting treatments adopted in financial statements and assess their suitability and acceptability</li><li>Appraise the financial performance and position of entities</li><li>Calculate accounting ratios relating to profitability, liquidity, efficiency and position</li><li>Develop accounting policies that meet reporting requirements and align with business models</li><li>Evaluate the various valuation models used by standard setters</li><li>Manage a documented system of accounting policies and procedures</li><li>Monitor changes and emerging trends in accounting standards and regulation</li><li>Provide financial leadership and strategic thinking to support sustainable value-creation</li><li>Supervise and review the preparation of consolidated financial statements, business activity reports and forecasts for management and external stakeholders</li></ul></li></ul><ul><li><div>Manage taxation-related functions within the organisation</div><ul><li>Articulate to management all relevant tax issues to minimise the organisation's tax liabilities</li><li>Assess the chargeable gains and losses of the organisation, as well as capital gain tax liabilities</li><li>Ensure there is a common understanding of the need for ethical and professional approaches in dealing with tax-related issues</li><li>Resolve tax-related issues with external tax experts</li><li>Supervise the calculation of taxable income and income tax liabilities of the organisation</li></ul></li></ul><ul><li><div>Manage strategic planning initiatives</div><ul><li>Determine and apply marginal and absorption standard costing concepts to calculate costs variances and profit variances</li><li>Identify and calculate both financial and non-financial performance measurements for reporting on the organisation's performance</li><li>Identify and understand the financing needs of the organisation</li><li>Interpret, investigate and report to management on variances, as well as develop a full understanding of the inter-relationships between variances</li><li>Oversee the preparation of the organisation's budget</li></ul></li></ul> ]]>
                </job-description>
                <education-levels>
                    <education-level>
                        <![CDATA[ Bachelor's Degree or equivalent ]]>
                    </education-level>
                </education-levels>
                <employment-types>
                    <employment-type>
                        <![CDATA[ Full Time ]]>
                    </employment-type>
                    <employment-type>
                        <![CDATA[ Contract ]]>
                    </employment-type>
                </employment-types>
                <experience-levels>
                    <experience-level>
                        <![CDATA[ Manager ]]>
                    </experience-level>
                </experience-levels>
                <last-updated-date>
                    <![CDATA[ 2023-11-06 06:32:28 +0800 ]]>
                </last-updated-date>
                <other-information>
                    <![CDATA[ ]]>
                </other-information>
                <company-description>
                    <![CDATA[ <p>The Monetary Authority of Singapore (MAS) is Singapores central bank and integrated financial regulator. MAS also works with the financial industry to develop Singapore as a dynamic international financial centre.</p> ]]>
                </company-description>
                <years-of-experience>
                    <![CDATA[ 2 ]]>
                </years-of-experience>
            </job>
            <job>
                <city>
                    <![CDATA[ Singapore ]]>
                </city>
                <title>
                    <![CDATA[ Finance Manager ]]>
                </title>
                <salary>
                    <salary-to>
                        <![CDATA[ 12000 ]]>
                    </salary-to>
                    <salary-from>
                        <![CDATA[ 6000 ]]>
                    </salary-from>
                    <salary-hidden>
                        <![CDATA[ FALSE ]]>
                    </salary-hidden>
                    <salary-period>
                        <![CDATA[ Monthly ]]>
                    </salary-period>
                    <salary-currency>
                        <![CDATA[ SGD ]]>
                    </salary-currency>
                </salary>
                <skills>
                    <skill>
                        <![CDATA[ Leadership ]]>
                    </skill>
                    <skill>
                        <![CDATA[ Interpersonal Skills ]]>
                    </skill>
                    <skill>
                        <![CDATA[ Managing Diversity ]]>
                    </skill>
                    <skill>
                        <![CDATA[ Developing People ]]>
                    </skill>
                    <skill>
                        <![CDATA[ Resource Management ]]>
                    </skill>
                </skills>
                <address>
                    <![CDATA[ 18 Boon Lay Way #07-121 Tradehub21 ]]>
                </address>
                <company>
                    <![CDATA[ ACME Singapore Pte Ltd ]]>
                </company>
                <country>
                    <![CDATA[ SG ]]>
                </country>
                <industry>
                    <![CDATA[ Banking & Financial Services ]]>
                </industry>
                <job-link>
                    <![CDATA[ http://empdemo.nemo.recruiterpal.com/career/jobs/zgoon ]]>
                </job-link>
                <job-roles>
                    <job-role>
                        <![CDATA[ Corporate Finance - Management ]]>
                    </job-role>
                </job-roles>
                <vacancies>
                    <![CDATA[ 1 ]]>
                </vacancies>
                <postal-code>
                    <![CDATA[ 609966 ]]>
                </postal-code>
                <posted-date>
                    <![CDATA[ 2023-11-06 01:32:37 +0800 ]]>
                </posted-date>
                <closing-date>
                    <![CDATA[ 2023-12-06 01:32:37 +0800 ]]>
                </closing-date>
                <company-logo>
                    <![CDATA[ http://tmsapi.nemo.recruiterpal.com/v1/external/entity-asset-stream/837zm/entity-type/8kr94/entity-id/8dewm/file-type/business-profile-logo ]]>
                </company-logo>
                <job-functions>
                    <job-function>
                        <![CDATA[ Corporate Finance ]]>
                    </job-function>
                </job-functions>
                <company-ref-id>
                    <![CDATA[ qj20rw ]]>
                </company-ref-id>
                <posting-ref-id>
                    <![CDATA[ zgoon ]]>
                </posting-ref-id>
                <qualifications>
                    <![CDATA[ <ul><li>Bachelor degree in associated discipline</li></ul> ]]>
                </qualifications>
                <job-description>
                    <![CDATA[ <p>The Finance Manager (FM) is the lead finance business partner for the organisation and has responsibilities covering all aspects of financial management, performance management, financial accounting, budgeting and corporate reporting. He/She reports to the Financial Controller. He/She must have sound technical as well as management skills and be able to lead a team consisting of finance professionals with varied, in-depth or niche technical knowledge and abilities. He/She consolidates their work and ensuring its quality and accuracy, especially for reporting purposes.<br><br>The FM is expected to provide sound financial advice and counsel (on working capital, financing or the financial position of the business) to the Financial Controller as well as the organisation's senior management and leadership team by synthesising internal and external data and studying the economic environment. He/She often has a key role in implementing best practices in order to identify and manage all financial and business risks and to meet the organisation's desired business and fiscal goals. He/She is expected to have a firm grasp of economic/business trends and to implement work improvement projects that are geared towards quality, compliance and efficiency in finance.</p><ul><li><div>Manage the organisation's management accounting and budgeting functions</div><ul><li>Adopt and promote Corporate Social Responsibility (CSR) reporting and its assurance using emerging frameworks to move towards an integrated reporting model combining financial and non-financial information</li><li>Evaluate current developments, such as sustainability rating systems, new frameworks and their potential impact on performance measurement and reporting</li><li>Maintain banking relationships for accounts for day-to-day transactions as well as investments</li><li>Prepare for the use and implementation of integrated reporting</li></ul></li></ul><ul><li><div>Drive the use and integration of information technology within the organisation's finance function</div><ul><li>Adopt cloud computing for the business</li><li>Ensure the appropriate set up of accounting rules in the organisation's financial system</li><li>Evaluate the effectiveness of the organisation's financial system and determine any areas of improvement</li><li>Identify and adopt business intelligence tools to analyse financial data and information</li><li>Use data mining and new analytical methodologies</li><li>Use management information systems strategically for effective management and control of the business</li></ul></li></ul><ul><li><div>Support the organisation as a business partner</div><ul><li>Advise management on the organisation's exposure to risks and the involvement of financial institutions, money market instruments and treasury management functions where applicable</li><li>Analyse and assess the impact of investment decisions on the financial position of the organisation</li><li>Analyse current market trends and provide strategic input to shape the organisation's key financial decisions</li><li>Analyse, compile and present management information for managerial decision making</li><li>Apply appropriate appraisal techniques and consideration for taxation, inflation and risk in investment decisions</li><li>Review the valuation of business and financial assets using different models</li></ul></li></ul><ul><li><div>Manage the organisation's financial accounting and corporate reporting functions</div><ul><li>Analyse the financial performance and position of the organisation and develop suitable accounting policies to meet reporting requirements</li><li>Apply professional judgement to identify accounting treatments adopted in financial statements and assess their suitability and acceptability</li><li>Appraise the financial performance and position of entities</li><li>Calculate accounting ratios relating to profitability, liquidity, efficiency and position</li><li>Develop accounting policies that meet reporting requirements and align with business models</li><li>Evaluate the various valuation models used by standard setters</li><li>Manage a documented system of accounting policies and procedures</li><li>Monitor changes and emerging trends in accounting standards and regulation</li><li>Provide financial leadership and strategic thinking to support sustainable value-creation</li><li>Supervise and review the preparation of consolidated financial statements, business activity reports and forecasts for management and external stakeholders</li></ul></li></ul><ul><li><div>Manage taxation-related functions within the organisation</div><ul><li>Articulate to management all relevant tax issues to minimise the organisation's tax liabilities</li><li>Assess the chargeable gains and losses of the organisation, as well as capital gain tax liabilities</li><li>Ensure there is a common understanding of the need for ethical and professional approaches in dealing with tax-related issues</li><li>Resolve tax-related issues with external tax experts</li><li>Supervise the calculation of taxable income and income tax liabilities of the organisation</li></ul></li></ul><ul><li><div>Manage strategic planning initiatives</div><ul><li>Determine and apply marginal and absorption standard costing concepts to calculate costs variances and profit variances</li><li>Identify and calculate both financial and non-financial performance measurements for reporting on the organisation's performance</li><li>Identify and understand the financing needs of the organisation</li><li>Interpret, investigate and report to management on variances, as well as develop a full understanding of the inter-relationships between variances</li><li>Oversee the preparation of the organisation's budget</li></ul></li></ul> ]]>
                </job-description>
                <education-levels>
                    <education-level>
                        <![CDATA[ Bachelor's Degree or equivalent ]]>
                    </education-level>
                </education-levels>
                <employment-types>
                    <employment-type>
                        <![CDATA[ Full Time ]]>
                    </employment-type>
                    <employment-type>
                        <![CDATA[ Contract ]]>
                    </employment-type>
                </employment-types>
                <experience-levels>
                    <experience-level>
                        <![CDATA[ Manager ]]>
                    </experience-level>
                </experience-levels>
                <last-updated-date>
                    <![CDATA[ 2023-11-06 06:32:28 +0800 ]]>
                </last-updated-date>
                <other-information>
                    <![CDATA[ ]]>
                </other-information>
                <company-description>
                    <![CDATA[ <p>The Monetary Authority of Singapore (MAS) is Singapore’s central bank and integrated financial regulator. MAS also works with the financial industry to develop Singapore as a dynamic international financial centre.</p> ]]>
                </company-description>
                <years-of-experience>
                    <![CDATA[ 3 ]]>
                </years-of-experience>
            </job>
            <job>
                <city>
                    <![CDATA[ Singapore ]]>
                </city>
                <title>
                    <![CDATA[ Accounting Executive ]]>
                </title>
                <salary>
                    <salary-hidden>
                        <![CDATA[ TRUE ]]>
                    </salary-hidden>
                </salary>
                <skills/>
                <address>
                    <![CDATA[ 7 Temasek Blvd ]]>
                </address>
                <company>
                    <![CDATA[ RecruiterPal (MR) ]]>
                </company>
                <country>
                    <![CDATA[ SG ]]>
                </country>
                <industry>
                    <![CDATA[ Software ]]>
                </industry>
                <job-link>
                    <![CDATA[ http://empdemo4.nemo.recruiterpal.com/career/jobs/kvrrp ]]>
                </job-link>
                <job-roles>
                    <job-role>
                        <![CDATA[ Basic Accounting/Bookkeeping/Accounts Executive ]]>
                    </job-role>
                </job-roles>
                <vacancies>
                    <![CDATA[ 1 ]]>
                </vacancies>
                <postal-code>
                    <![CDATA[ 038987 ]]>
                </postal-code>
                <posted-date>
                    <![CDATA[ 2023-11-06 01:32:37 +0800 ]]>
                </posted-date>
                <closing-date>
                    <![CDATA[ 2023-12-06 01:32:37 +0800 ]]>
                </closing-date>
                <company-logo>
                    <![CDATA[ http://tmsapi.nemo.recruiterpal.com/v1/external/entity-asset-stream/837zm/entity-type/8kr94/entity-id/8qjdy/file-type/business-profile-logo ]]>
                </company-logo>
                <job-functions>
                    <job-function>
                        <![CDATA[ Accounting ]]>
                    </job-function>
                </job-functions>
                <company-ref-id>
                    <![CDATA[ bqwso4 ]]>
                </company-ref-id>
                <posting-ref-id>
                    <![CDATA[ kvrrp ]]>
                </posting-ref-id>
                <qualifications>
                    <![CDATA[ <ul><li>Accounting description</li></ul> ]]>
                </qualifications>
                <job-description>
                    <![CDATA[ <ul><li>Accounting description</li></ul> ]]>
                </job-description>
                <education-levels>
                    <education-level>
                        <![CDATA[ Bachelor's Degree or equivalent ]]>
                    </education-level>
                </education-levels>
                <employment-types>
                    <employment-type>
                        <![CDATA[ Full Time ]]>
                    </employment-type>
                </employment-types>
                <experience-levels>
                    <experience-level>
                        <![CDATA[ Executive ]]>
                    </experience-level>
                </experience-levels>
                <last-updated-date>
                    <![CDATA[ 2023-11-06 06:32:28 +0800 ]]>
                </last-updated-date>
                <other-information>
                    <![CDATA[ ]]>
                </other-information>
                <company-description>
                    <![CDATA[ <p>At RecruiterPal, we see ourselves as change agents; We are driven to make a real difference in the way our clients manage recruitment and talent acquisition efforts. Through the use of our recruitment technology, we have empowered our clients to connect faster, better and smarter with choice candidates, and enabled thousands of people in finding their choice career.</p><p>If you are intellectually curious by nature, and believe in the power of technology to change peoples' lives, we would love to have a conversation with you.</p> ]]>
                </company-description>
                <years-of-experience>
                    <![CDATA[ 2 ]]>
                </years-of-experience>
            </job>
        </source>`);
    }
}

module.exports = Controller;