import { Layout } from "@/components/Layout";

export default function TermsPage() {
  return (
    <Layout>
      <div className="container py-12">
        <div className="max-w-3xl mx-auto prose prose-sm dark:prose-invert">
          <h1 className="text-3xl font-bold mb-6">Conditions of Use</h1>
          <p className="text-muted-foreground mb-8">Last updated: February 2024</p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">1. Welcome to Marketplace</h2>
            <p className="text-muted-foreground">
              By using our services, you agree to these conditions. Please read them carefully. Our services are offered subject to your acceptance of all of the terms and conditions contained herein.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">2. Use of the Service</h2>
            <p className="text-muted-foreground mb-4">
              You may use our services only as permitted by law. You must be at least 18 years old to use our services. By using our services, you represent and warrant that you are of legal age.
            </p>
            <p className="text-muted-foreground">
              You agree not to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1 mt-2">
              <li>Use our services for any illegal purpose</li>
              <li>Infringe on intellectual property rights</li>
              <li>Upload malicious content or software</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with other users' use of the services</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">3. Your Account</h2>
            <p className="text-muted-foreground">
              You may need an account to use some services. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. Please notify us immediately of any unauthorized use.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">4. Orders and Payments</h2>
            <p className="text-muted-foreground mb-4">
              When you place an order, you offer to purchase the product at the listed price. We reserve the right to refuse or cancel orders for any reason, including product availability, errors in pricing, or suspected fraud.
            </p>
            <p className="text-muted-foreground">
              Payment is due at the time of order placement. We accept major credit cards, debit cards, and other payment methods as displayed at checkout.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">5. Products and Content</h2>
            <p className="text-muted-foreground">
              Products on Marketplace are sold by various sellers. We act as a marketplace and do not manufacture or endorse products unless explicitly stated. Product descriptions, images, and specifications are provided by sellers.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">6. Returns and Refunds</h2>
            <p className="text-muted-foreground">
              Our return policy allows returns within 30 days for most items. Some products may have different return windows. Please see our Returns Policy for complete details.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">7. Intellectual Property</h2>
            <p className="text-muted-foreground">
              All content on our services, including text, graphics, logos, and software, is owned by Marketplace or its licensors and is protected by copyright, trademark, and other laws.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">8. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              To the maximum extent permitted by law, Marketplace shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">9. Modifications</h2>
            <p className="text-muted-foreground">
              We may modify these conditions at any time. Continued use of our services after changes constitutes acceptance of the modified terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">10. Contact</h2>
            <p className="text-muted-foreground">
              If you have questions about these Conditions of Use, please contact us through our Help Center.
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
}
