import React from "react";
import Table from "react-bootstrap/Table";
import { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import { useNavigate } from "react-router-dom";
import {
  deleteAsync,
  selectInvoice,
  selectStatus,
} from "../features/invoices/invoiceSlice";
import { getInvoiceList } from "../utils/apis";

const Home = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [id, setId] = useState();
  const [invoices, setInvoices] = useState([]);
  const navigate = useNavigate();

  const createInvoice = () => {
    navigate("/create-invoice");
  };

  const actionInvoice = (id, action) => {
    switch (action) {
      case "Edit":
        navigate(`/edit-invoice/${id}`);
        break;
      case "Delete":
        break;
      case "View":
        setId(id);
        setIsOpen(true);
        break;
      default:
        break;
    }
  };

  const fetchInvoices = async () => {
    try {
      let response = await getInvoiceList()
      if (response.status == 200) {
        setInvoices(response.data.invoices || [])
      }
      else {
        console.error('There was an error fetching the initial data:');
      }
    }
    catch (err) {
      console.log(err)
    }
  }
  useEffect(() => {
    fetchInvoices()
  }, []);

  return (
    <div className="m-5">
      <Button variant="primary" onClick={createInvoice}>
        Create Invoice
      </Button>

      <Table striped bordered hover size="sm">
        <thead>
          <tr>
            <th>Invoice Number</th>
            <th>PO Date</th>
            <th>PO Number</th>
            <th>Company Name</th>
            <th>Company City</th>
            <th>Company State</th>
            <th>Company Pincode</th>
            <th>Company GST Number</th>
            <th>CGST</th>
            <th>IGST</th>
            <th>SGST</th>
            <th>Total</th>
            <th>Grand Total</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map(invoice => (
            <tr key={invoice._id}>
              <td>{invoice.invoiceNumber}</td>
              <td>{new Date(invoice.PODate).toLocaleDateString()}</td>
              <td>{invoice.PONumber}</td>
              <td>{invoice.companyName}</td>
              <td>{invoice.companyCity}</td>
              <td>{invoice.companyState}</td>
              <td>{invoice.companyPincode}</td>
              <td>{invoice.companyGSTNumber}</td>
              <td>{invoice.cgst}</td>
              <td>{invoice.igst}</td>
              <td>{invoice.sgst}</td>
              <td>{invoice.currency} {invoice.total.toFixed(2)}</td>
              <td>{invoice.currency} {invoice.grandTotal.toFixed(2)}</td>
              <Button
                variant="outline-success"
                className="m-1"
                onClick={() => actionInvoice(invoice.info.id, "View")}
              >
                View
              </Button>
              <Button
                variant="outline-info"
                className="m-1"
                onClick={() => actionInvoice(invoice.info.id, "Edit")}
              >
                Edit
              </Button>{" "}
              <Button
                variant="outline-danger"
                className="m-1"
                onClick={() => actionInvoice(invoice.info.id, "Delete")}
              >
                Delete
              </Button>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default Home;
