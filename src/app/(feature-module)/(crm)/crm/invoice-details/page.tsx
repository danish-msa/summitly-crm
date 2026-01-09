import InvoiceDetailsComponent from "@/components/Pages/application-module/invoice/invoiceDetails";
import InvoicesDetailsComponent2 from "@/components/Pages/crm-module/invoices/invoicesDetails";

export const metadata = {
  title: "Invoices Details | CRMS - Advanced Bootstrap 5 Admin Template for Customer Management",
};

export default function Invoicedetails(){
    return(
        <>
        <InvoicesDetailsComponent2/>
        </>
    )
}