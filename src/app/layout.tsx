
import BootstrapJs from "@/core/common/bootstrap-js/bootstrapjs";
import "bootstrap/dist/css/bootstrap.min.css";
import "@tabler/icons-webfont/dist/tabler-icons.css";
import "@fortawesome/fontawesome-free/css/fontawesome.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "bootstrap-daterangepicker/daterangepicker.css";
import "@/index.scss"; // Adjust path if needed

export const metadata = {
  title: "Dashboard | CRMS - Advanced Bootstrap 5 Admin Template for Customer Management",
  description: "Streamline your business with our advanced CRM template...",
  keywords: "Advanced CRM template, customer relationship management...",
  author: "Dreams Technologies",
  icons: {
    icon: "favicon.png",
    shortcut: "favicon.png", // Add shortcut icon for better support
    apple: "apple-icon.png", // Optional: for Apple devices (place in `public/`)
  },

};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <BootstrapJs />
      </body>
    </html>
  );
}
