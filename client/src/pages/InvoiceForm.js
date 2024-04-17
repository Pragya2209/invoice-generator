import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Card from "react-bootstrap/Card";
import { InvoiceItem } from "../components/index";
import { createInvoice, getList } from "../utils/apis";

class InvoiceForm extends React.Component {
  constructor(props) {
    super(props);
    const { invoiceData: data } = this.props;
    if (data) {
      const { info, items, total, grandTotal, currency } = data;
      this.state = {
        id: info.id,
        currency: currency,
        currentDate: info.currentDate,
        PODate: info.PODate,
        PONumber: info.PONumber,
        companyName: info.companyName,
        companyAddress: info.companyAddress,
        companyCity: info.companyCity,
        companyState: info.companyState,
        companyCountry: info.companyCountry,
        companyPincode: info.companyPincode,
        companyGSTNumber: info.companyGSTNumber,
        cgstPerc: info.cgstPerc,
        igstPerc: info.igstPerc,
        sgstPerc: info.sgstPerc,
        cgst: info.cgst,
        igst: info.igst,
        sgst: info.sgst,
        total: total,
        grandTotal: grandTotal,
        hsn: info.hsn,
        items: items,
        companyList: [],
        gstList: []
      };
      this.editField = this.editField.bind(this);
      this.handleAddEvent = this.handleAddEvent.bind(this);
      return;
    }
    this.state = {
      id: (+new Date() + Math.floor(Math.random() * 999999)).toString(36),
      currency: "Rs",
      currentDate: new Date().toLocaleDateString(),
      PODate: "",
      PONumber: "",
      companyName: "",
      companyCity: "",
      companyState: "",
      companyCountry: "India",
      companyPincode: "",
      companyGSTNumber: "",
      cgstPerc: 0,
      igstPerc: 0,
      sgstPerc: 0,
      cgst: 0,
      igst: 0,
      sgst: 0,
      total: 0,
      grandTotal: 0,
      hsn: "",
      items: [
        {
          id: (+new Date() + Math.floor(Math.random() * 999999)).toString(36),
          name: "",
          description: "",
          rate: 0.0,
          quantity: 0,
          amount: 0.0
        },
      ],
      companyList: [],
      gstList: []
    };
    this.editField = this.editField.bind(this);
    this.handleAddEvent = this.handleAddEvent.bind(this);
  }

  componentDidMount(prevProps) {
    this.handleCalculateTotal();
    getList().then(response => {
      if (response.status == 200) {
        this.setState({
          gstList: response?.data?.gstList || [],
          companyList: response?.data?.companyList || [],
        });
      }
      else {
        console.error('There was an error fetching the initial data:');
      }
    }).catch(error => {
      console.error('There was an error fetching the initial data:', error);
    });
  }

  handleAddEvent(evt) {
    var id = (+new Date() + Math.floor(Math.random() * 999999)).toString(36);
    var items = {
      id: id,
      rate: 1.0,
      name: "",
      description: "",
      quantity: 1,
      amount: 1.0
    };
    this.state.items.push(items);
    this.setState(this.state.items, () => {
      this.handleCalculateTotal();
    });
  }
  handleRowDel(itemToDelete) {
    const filteredItems = this.state.items.filter(
      (item) => item !== itemToDelete
    );
    this.setState({ items: filteredItems }, () => {
      this.handleCalculateTotal();
    });
  }
  handleCalculateTotal() {
    var items = this.state.items;
    var total = items
      .reduce((acc, item) => {
        return acc + parseFloat(item.amount.toFixed(2))
      }, 0)

    this.setState(
      {
        total: parseFloat(total.toFixed(2))
      },
      () => {
        this.setState(
          {
            cgst: parseFloat(
              (parseFloat(total) * parseFloat(this.state.cgstPerc / 100)).toFixed(2)
            )
          },
          () => {
            this.setState(
              {
                sgst: parseFloat(
                  (parseFloat(total) * parseFloat(this.state.sgstPerc / 100)).toFixed(2)
                )
              },
              () => {
                this.setState(
                  {
                    igst: parseFloat(
                      (parseFloat(total) * parseFloat(this.state.igstPerc / 100)).toFixed(2)
                    )
                  },
                  () => {
                    this.setState(
                      {
                        grandTotal: parseFloat((this.state.total + this.state.igst + this.state.sgst + this.state.cgst).toFixed(2))
                      },
                    );
                  }
                );
              }
            );
          }
        );
      }
    );
  }

  async addInvoice() {
    try {
      const allItemsValid = this.state.items.every(item =>
        item.name !== null &&
        item.description !== null &&
        typeof item.quantity == 'number' &&
        item.quantity >= 0 &&
        typeof item.rate == 'number' &&
        item.rate !== null &&
        typeof item.amount == 'number' &&
        item.amount >= 0
      );
      if (!allItemsValid)
        return
      let response = await createInvoice(this.state)
      if (!response.ok) throw new Error('Network response was not ok');
      const filename = response.headers.get('Content-Disposition')?.split('filename=')[1] ?? 'invoice.pdf';

      // Create a Blob from the response data
      const blob = await response.blob();

      // Create an invisible anchor element to trigger download
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute('download', filename); // Set filename
      document.body.appendChild(link); // Required for Firefox
      link.click(); // Trigger download
      document.body.removeChild(link); // Clean up

    }
    catch (err) {
      console.log(err)
    }
  }
  onItemizedItemEdit(evt) {
    var item = {
      id: evt.target.id,
      name: evt.target.name,
      value: evt.target.value,
    };
    var items = this.state.items.slice();
    var newItems = items.map(function (items) {
      for (var key in items) {

        if (key == item.name && items.id == item.id) {
          if (key == 'description' || key == 'name') {
            items[key] = item.value
          }
          else {
            if (!item.value)
              item.value = 0
            items[key] = parseFloat(item.value);
          }
          items['amount'] = items['rate'] * items['quantity']
        }
      }
      return items;
    });
    this.setState({ items: newItems });
    this.handleCalculateTotal();
  }
  editField = (event) => {
    let value = event.target.value
    if (event.target.name == 'companyName') {
      const selectedCompany = this.state.companyList.find(company => company.name == value);
      if (selectedCompany) {
        let state = selectedCompany.state
        const gstRate = this.state.gstList.find(gst => gst.state == state);

        this.setState({
          companyName: selectedCompany.name,
          companyState: selectedCompany.state || '',
          companyCountry: selectedCompany.country || 'India',
          companyAddress: selectedCompany.address || '',
          companyPincode: selectedCompany.pincode || '',
          companyGSTNumber: selectedCompany.gst || '',
          companyCity: selectedCompany.city || '',
          cgstPerc: gstRate.CGST || 0,
          igstPerc: gstRate.IGST || 0,
          sgstPerc: gstRate.SGST || 0,
        });
      } else {
        this.setState({ companyName: value });
        // Optionally clear other fields if the company name does not match
      }
    }
    else if (event.target.name == 'companyState') {
      let state = event.target.value
      const gstRate = this.state.gstList.find(gst => gst.state == state);
      if (gstRate) {
        this.setState({
          cgstPerc: gstRate.CGST || 0,
          igstPerc: gstRate.IGST || 0,
          sgstPerc: gstRate.SGST || 0,
          companyState: event.target.value
        });
      }
      else {
        this.setState({
          companyState: event.target.value
        });
      }
    }
    else {
      this.setState(() => ({
        [event.target.name]: value,
      }));
    }
    this.handleCalculateTotal();
  };
  onCurrencyChange = (selectedOption) => {
    this.setState(selectedOption);
  };
  openModal = (event) => {
    event.preventDefault();
    
  };
  render() {
    return (
      <Form onSubmit={this.openModal} className="justify-content-center">
        <Row>
          <Col md={8} lg={9}>
            <Card className="p-4 p-xl-5 my-3 my-xl-4">
              <div className="d-flex flex-row align-items-start justify-content-between mb-3">
                <div className="d-flex flex-column">
                  <div className="d-flex flex-column">
                    <div className="mb-2">
                      <span className="fw-bold">Current&nbsp;Date:&nbsp;</span>
                      <span className="current-date">
                        {this.state.currentDate}
                      </span>
                    </div>
                  </div>

                </div>
                {/* <div className="d-flex flex-row align-items-center">
                  <span className="fw-bold me-2">
                    Invoice&nbsp;Number:&nbsp;
                  </span>
                  <Form.Control
                    type="number"
                    value={this.state.invoiceNumber}
                    name={"invoiceNumber"}
                    onChange={(event) => this.editField(event)}
                    min="1"
                    style={{
                      maxWidth: "70px",
                    }}
                    required="required"
                  />
                </div> */}
              </div>
              <hr className="my-4" />
              <Row className="mb-5">
                <Col>
                  <Form.Group controlId="formCompanyName">

                    <Form.Label className="fw-bold">Bill to:</Form.Label>
                    <Form.Control
                      placeholder={"Company Name"}
                      rows={3}
                      value={this.state.companyName}
                      list="companyList"
                      type="text"
                      name="companyName"
                      className="my-2"
                      onChange={(event) => this.editField(event)}
                      required="required"
                    />
                    <datalist id="companyList">
                      {this.state.companyList.map((company, index) => (
                        <option key={index} value={company.name} />
                      ))}
                    </datalist>
                  </Form.Group>
                  <Form.Control
                    placeholder={"Company Address"}
                    rows={3}
                    value={this.state.companyAddress}
                    type="text"
                    name="companyAddress"
                    className="my-2"
                    onChange={(event) => this.editField(event)}
                    autoComplete="name"
                    required="required"
                  />
                  <Form.Control
                    placeholder={"Company City"}
                    value={this.state.companyCity}
                    type="text"
                    name="companyCity"
                    className="my-2"
                    onChange={(event) => this.editField(event)}
                    autoComplete="email"
                    required="required"
                  />
                  <Form.Control
                    placeholder={"Company State"}
                    value={this.state.companyState}
                    type="text"
                    name="companyState"
                    className="my-2"
                    onChange={(event) => this.editField(event)}
                    required="required"
                  />
                  <Form.Control
                    placeholder={"Company Country"}
                    value={this.state.companyCountry}
                    type="text"
                    name="companyCountry"
                    className="my-2"
                    onChange={(event) => this.editField(event)}
                    required="required"
                  />
                  <Form.Control
                    placeholder={"Company Pincode"}
                    value={this.state.companyPincode}
                    type="text"
                    name="companyPincode"
                    className="my-2"
                    onChange={(event) => this.editField(event)}
                    required="required"
                  />
                  <Form.Control
                    placeholder={"GST Number"}
                    value={this.state.companyGSTNumber}
                    type="text"
                    name="companyGSTNumber"
                    className="my-2"
                    onChange={(event) => this.editField(event)}
                    required="required"
                  />
                </Col>
                <Col>
                  <Form.Label className="fw-bold">PO Info:</Form.Label>
                  <Form.Control
                    className="d-flex flex-row align-items-center"
                    type="date"
                    value={this.state.PODate}
                    name={"PODate"}
                    onChange={(event) => this.editField(event)}
                    style={{
                      maxWidth: "150px",
                    }}
                    required="required"
                  />

                  <Form.Control
                    placeholder={"PO Number"}
                    value={this.state.PONumber}
                    type="text"
                    name="PONumber"
                    className="my-2"
                    onChange={(event) => this.editField(event)}
                    autoComplete="email"
                    required="required"
                  />
                </Col>
              </Row>
              <InvoiceItem
                onItemizedItemEdit={this.onItemizedItemEdit.bind(this)}
                onRowAdd={this.handleAddEvent.bind(this)}
                onRowDel={this.handleRowDel.bind(this)}
                currency={this.state.currency}
                items={this.state.items}
              />
              <Row className="mt-4 justify-content-end">
                <Col lg={6}>
                  <div className="d-flex flex-row align-items-start justify-content-between">
                    <span className="fw-bold">Total:</span>
                    <span>
                      {this.state.currency}
                      {this.state.total}
                    </span>
                  </div>

                  <div className="d-flex flex-row align-items-start justify-content-between">
                    <span className="fw-bold">CGST <input
                      value={this.state.cgstPerc}
                      type="number"
                      name="cgstPerc"
                      onChange={(event) => this.editField(event)}
                      style={{ 'maxWidth': '22%' }}
                      required="required"
                    /> :</span>
                    <span>
                      {this.state.currency}
                      {this.state.cgst}
                    </span>
                  </div>

                  <div className="d-flex flex-row align-items-start justify-content-between">
                    <span className="fw-bold">SGST <input
                      value={this.state.sgstPerc}
                      type="number"
                      name="sgstPerc"
                      onChange={(event) => this.editField(event)}
                      style={{ 'maxWidth': '22%' }}
                      required="required"
                    /> :</span>
                    <span>
                      {this.state.currency}
                      {this.state.sgst}
                    </span>
                  </div>

                  <div className="d-flex flex-row align-items-start justify-content-between">
                    <span className="fw-bold">IGST <input
                      value={this.state.igstPerc}
                      type="number"
                      name="igstPerc"
                      onChange={(event) => this.editField(event)}
                      style={{ 'maxWidth': '22%' }}
                      required="required"
                    />:</span>
                    <span>
                      {this.state.currency}
                      {this.state.igst}
                    </span>
                  </div>

                  <div className="d-flex flex-row align-items-start justify-content-between">
                    <span className="fw-bold">GrandTotal:</span>
                    <span>
                      {this.state.currency}
                      {this.state.grandTotal}
                    </span>
                  </div>

                  <hr />
                  <div
                    className="d-flex flex-row align-items-start justify-content-between"
                    style={{
                      fontSize: "1.125rem",
                    }}
                  >
                    <span className="fw-bold">Total:</span>
                    <span className="fw-bold">
                      {this.state.currency}
                      {this.state.grandTotal || 0}
                    </span>
                  </div>
                </Col>
              </Row>

            </Card>
          </Col>
          <Col md={4} lg={3}>
            <div className="sticky-top pt-md-3 pt-xl-4">
              <Button onClick={this.addInvoice.bind(this)} variant="primary" type="submit" className="d-block w-100">
                Add Invoice
              </Button>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Currency:</Form.Label>
                <Form.Select
                  onChange={(event) =>
                    this.onCurrencyChange({ currency: event.target.value })
                  }
                  className="btn btn-light my-1"
                  aria-label="Change Currency"
                >
                  <option value="Rs">INR (Indian Rupees)</option>
                  <option value="$">USD (United States Dollar)</option>
                  <option value="£">GBP (British Pound Sterling)</option>
                  <option value="¥">JPY (Japanese Yen)</option>
                  <option value="$">CAD (Canadian Dollar)</option>
                  <option value="$">AUD (Australian Dollar)</option>
                  <option value="$">SGD (Signapore Dollar)</option>
                  <option value="¥">CNY (Chinese Renminbi)</option>
                  <option value="₿">BTC (Bitcoin)</option>
                </Form.Select>
              </Form.Group>
            </div>
          </Col>
        </Row>
      </Form>
    );
  }
}

export default InvoiceForm;
