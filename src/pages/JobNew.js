import { useCallback, useEffect, useState } from "react";

import NavBar from "../components/navBar/NavBar";

import FooterPage from "../components/footer/FooterComponent";
import { useNavigate, useNavigationType } from "react-router";
import { supabase } from "../utils/supabase";
import Select from "react-select";
import DraftEditor from "./DraftEditor";
import { EditorState } from "draft-js";
import { stateToHTML } from "draft-js-export-html";

import PageTitle from "../components/titles/PageTitle";
import BigLoading from "../components/spinners/Loading";
import ErrorMessage from "../components/spinners/ErrorMessage";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const JobNew = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    customer_id: null,
    vehicle_registration_number: "",
    vehicle_make: "",
    vehicle_model: "",
    vehicle_mileage: "",
    status: { label: "Progress", value: "progress" },
    start_date: new Date(),
    expected_time: "",
    actual_time: "",
    diagnostics_report: "",
    reported_defects: "",
    completed_action: "",
    complaints: "",
  });

  const [customers, setCustomers] = useState([]);

  const [diagnosticsReport, setDiagnosticsReport] = useState(() =>
    EditorState.createEmpty()
  );

  const [reportedDefects, setReportedDefects] = useState(() =>
    EditorState.createEmpty()
  );

  const [completedAction, setCompletedAction] = useState(() =>
    EditorState.createEmpty()
  );

  const [complaints, setComplaints] = useState(() => EditorState.createEmpty());

  const navigate = useNavigate();

  const navigationType = useNavigationType();

  const handleBack = () => {
    // Fallback if there's no browser history
    if (navigationType === "POP") {
      navigate("/jobs");
    } else {
      navigate(-1);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelect = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (field, date) => {
    setForm((prev) => ({
      ...prev,
      [field]: date,
    }));
  };

  const fetchCustomers = useCallback(async () => {
    try {
      const { data, error } = await supabase.from("customers").select("*");
      if (error) throw error;
      setCustomers(data);
    } catch (err) {
      console.error("Unexpected error:", err);
      setError({
        message:
          "Error fetching customers, please check your internet and refresh the page",
      });
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleSave = async () => {
    try {
      setLoading(true);

      const productData = {
        customer_id: form?.customer_id?.id,
        vehicle_registration_number: form.vehicle_registration_number,
        vehicle_make: form.vehicle_make,
        vehicle_model: form.vehicle_model,
        vehicle_mileage: form.vehicle_mileage,
        status: form.status?.value || null,
        start_date: form.start_date,
        expected_time: form.expected_time,
        actual_time: form.actual_time,
        diagnostics_report: stateToHTML(diagnosticsReport.getCurrentContent()),
        reported_defects: stateToHTML(reportedDefects.getCurrentContent()),
        completed_action: stateToHTML(completedAction.getCurrentContent()),
        complaints: stateToHTML(complaints.getCurrentContent()),
      };

      const { data, error } = await supabase.from("jobs").insert([productData]);

      if (error) {
        throw error;
      }

      navigate("/jobs");
      return { success: true, data };
    } catch (err) {
      console.error("Error saving job:", err);
      setError(err);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NavBar />

      <PageTitle name={"New Job"} />
      {error.message && <ErrorMessage message={error.message} />}

      {loading ? (
        <BigLoading />
      ) : (
        <div className="container">
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-end",
              marginTop: "10px",
            }}
          >
            <button
              onClick={handleBack}
              style={{ marginBottom: "10px" }}
              className="ttm-btn ttm-btn-size-md ttm-btn-shape-square ttm-btn-style-fill ttm-icon-btn-left ttm-btn-color-skincolor"
            >
              <i className="ti ti-arrow-left"></i> Back
            </button>
          </div>
          <div
            id="ttm-contactform"
            className="ttm-contactform wrap-form clearfix"
          >
            {/* <h5>Customer Details</h5>
            <div className="row">
              <div className="col-lg-3">
                <h6 style={{ marginTop: "20px" }}>Name</h6>
                <label>
                  <span className="text-input">
                    <input
                      type="text"
                      placeholder="Unit measuremnet"
                      required="required"
                      name={"customer_name"}
                      value={form?.customer_id?.name}
                      onChange={handleChange}
                      readOnly
                    />
                  </span>
                </label>
              </div>
              <div className="col-lg-3">
                <h6 style={{ marginTop: "20px" }}>Customer Surname</h6>
                <label>
                  <span className="text-input">
                    <input
                      type="text"
                      placeholder="Customer Surname"
                      required="required"
                      name={"customer_surname"}
                      value={form?.customer_id?.surname}
                      onChange={handleChange}
                      readOnly
                    />
                  </span>
                </label>
              </div>
              <div className="col-lg-3">
                <h6 style={{ marginTop: "20px" }}>Customer Phone</h6>
                <label>
                  <span className="text-input">
                    <input
                      type="text"
                      placeholder="Customer Surname"
                      required="required"
                      name={"customer_surname"}
                      value={form?.customer_id?.phone}
                      onChange={handleChange}
                      readOnly
                    />
                  </span>
                </label>
              </div>

              <div className="col-lg-3">
                <h6 style={{ marginTop: "20px" }}>Email</h6>
                <label>
                  <span className="text-input">
                    <input
                      type="text"
                      placeholder="Brand"
                      required="required"
                      name={"brand"}
                      value={form?.customer_id?.email}
                      onChange={handleChange}
                    />
                  </span>
                </label>
              </div>
            </div> */}

            <h5>Customer Details</h5>
            <div className="row">
              <div className="col-lg-3">
                <h6 style={{ marginTop: "20px" }}>Select Customer</h6>
                <label>
                  <span className="text-input">
                    <Select
                      options={customers.map((c) => ({
                        value: c.id,
                        label: `${c.name} ${c.surname}`,
                        data: c,
                      }))}
                      onChange={(selected) =>
                        setForm((prev) => ({
                          ...prev,
                          customer_id: selected.data,
                        }))
                      }
                      placeholder="Select a customer..."
                      isSearchable={true}
                    />
                  </span>
                </label>
              </div>

              <div className="col-lg-3">
                <h6 style={{ marginTop: "20px" }}>Customer Name</h6>
                <label>
                  <span className="text-input">
                    <input
                      type="text"
                      placeholder="Name"
                      value={form?.customer_id?.name || ""}
                      readOnly
                    />
                  </span>
                </label>
              </div>

              <div className="col-lg-3">
                <h6 style={{ marginTop: "20px" }}>Customer Surname</h6>
                <label>
                  <span className="text-input">
                    <input
                      type="text"
                      placeholder="Customer Surname"
                      value={form?.customer_id?.surname || ""}
                      readOnly
                    />
                  </span>
                </label>
              </div>

              <div className="col-lg-3">
                <h6 style={{ marginTop: "20px" }}>Customer Phone</h6>
                <label>
                  <span className="text-input">
                    <input
                      type="text"
                      placeholder="Customer Phone"
                      value={form?.customer_id?.phone || ""}
                      readOnly
                    />
                  </span>
                </label>
              </div>

              <div className="col-lg-3">
                <h6 style={{ marginTop: "20px" }}>Email</h6>
                <label>
                  <span className="text-input">
                    <input
                      type="text"
                      placeholder="Customer Email"
                      value={form?.customer_id?.email || ""}
                      readOnly
                    />
                  </span>
                </label>
              </div>
            </div>

            <h5>Vehicle Details</h5>
            <div className="row">
              <div className="col-lg-3">
                <h6 style={{ marginTop: "20px" }}>Registration Number</h6>
                <label>
                  <span className="text-input">
                    <input
                      type="text"
                      required="required"
                      name={"vehicle_registration_number"}
                      value={form?.vehicle_registration_number}
                      onChange={handleChange}
                    />
                  </span>
                </label>
              </div>
              <div className="col-lg-3">
                <h6 style={{ marginTop: "20px" }}>Vehicle Make</h6>
                <label>
                  <span className="text-input">
                    <input
                      type="text"
                      required="required"
                      name={"vehicle_make"}
                      value={form?.vehicle_make}
                      onChange={handleChange}
                    />
                  </span>
                </label>
              </div>
              <div className="col-lg-3">
                <h6 style={{ marginTop: "20px" }}>Vehicle Model</h6>
                <label>
                  <span className="text-input">
                    <input
                      type="text"
                      required="required"
                      name={"vehicle_model"}
                      value={form?.vehicle_model}
                      onChange={handleChange}
                    />
                  </span>
                </label>
              </div>

              <div className="col-lg-3">
                <h6 style={{ marginTop: "20px" }}>Vehicle Mileage(KM)</h6>
                <label>
                  <span className="text-input">
                    <input
                      type="text"
                      required="required"
                      name={"vehicle_mileage"}
                      value={form?.vehicle_mileage}
                      onChange={handleChange}
                    />
                  </span>
                </label>
              </div>
            </div>

            <h5>Job Details</h5>
            <div className="row">
              <div className="col-lg-3">
                <label>
                  <h6 style={{ marginTop: "20px" }}>Status</h6>
                  <span className="text-input">
                    <Select
                      value={form?.status}
                      onChange={(e) => handleSelect("status", e)}
                      options={[
                        { label: "Progress", value: "progress" },
                        { label: "Completed", value: "completed" },
                      ]}
                    />
                  </span>
                </label>
              </div>
              <div className="col-lg-3">
                <h6 style={{ marginTop: "20px" }}>Start Date</h6>
                <label>
                  <span className="text-input">
                    {/* <input
                      type="text"
                      required="required"
                      name={"start_date"}
                      value={form?.start_date}
                      onChange={handleChange}
                      readOnly
                    /> */}
                    <DatePicker
                      selected={
                        form?.start_date ? new Date(form.start_date) : null
                      }
                      onChange={(date) => handleDateChange("start_date", date)}
                      dateFormat="dd-MMM-YYYY"
                      className="form-control"
                      style={{ zIndex: 1000 }}
                      placeholderText="Select start date"
                      popperClassName="datepicker-zindex"
                    />
                  </span>
                </label>
              </div>
              <div className="col-lg-3">
                <h6 style={{ marginTop: "20px" }}>Expected Time(Hours)</h6>
                <label>
                  <span className="text-input">
                    <input
                      type="text"
                      required="required"
                      name={"expected_time"}
                      value={form?.expected_time}
                      onChange={handleChange}
                    />
                  </span>
                </label>
              </div>
              <div className="col-lg-3">
                <h6 style={{ marginTop: "20px" }}>Time Taken(Hours)</h6>
                <label>
                  <span className="text-input">
                    <input
                      type="text"
                      required="required"
                      name={"actual_time"}
                      value={form?.actual_time}
                      onChange={handleChange}
                    />
                  </span>
                </label>
              </div>

              <div className="col-lg-12">
                <h6 style={{ marginTop: "20px" }}>Diagnostics Report</h6>
                <DraftEditor
                  editorState={diagnosticsReport}
                  setEditorState={setDiagnosticsReport}
                />
              </div>
              <div className="col-lg-12">
                <h6 style={{ marginTop: "20px" }}>Reported Defects</h6>
                <DraftEditor
                  editorState={reportedDefects}
                  setEditorState={setReportedDefects}
                />
              </div>
              <div className="col-lg-12">
                <h6 style={{ marginTop: "20px" }}> Completed Action</h6>
                <DraftEditor
                  editorState={completedAction}
                  setEditorState={setCompletedAction}
                />
              </div>
              <div className="col-lg-12">
                <h6 style={{ marginTop: "20px" }}> Complaints</h6>
                <DraftEditor
                  editorState={complaints}
                  setEditorState={setComplaints}
                />
              </div>
            </div>

            <input
              style={{ marginBottom: "20px" }}
              name="submit"
              type="submit"
              id="submit"
              className="submit ttm-btn ttm-btn-size-md ttm-btn-shape-square ttm-btn-style-fill ttm-btn-color-skincolor"
              value="Save New Job"
              onClick={handleSave}
            />
          </div>
        </div>
      )}

      <FooterPage />
    </>
  );
};

export default JobNew;
