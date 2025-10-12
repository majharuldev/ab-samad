
import React, { useContext, useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import BtnSubmit from "../../../components/Button/BtnSubmit";
import { InputField, SelectField } from "../../../components/Form/FormFields";
import toast from "react-hot-toast";
import api from "../../../../utils/axiosConfig";
import { AuthContext } from "../../../providers/AuthProvider";
import { useNavigate, useParams } from "react-router-dom";

const AdvanceSalaryForm = () => {
  const methods = useForm();
  const { handleSubmit, reset, control, setValue } = methods;
  const [employees, setEmployees] = useState([]);
  const [userName, setUserName] = useState("");
  const { user } = useContext(AuthContext);
  const userId = user?.id;
  const { id } = useParams();
  const navigate = useNavigate()

  // Fetch employees & user info
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empRes, userRes] = await Promise.all([
          api.get(`/employee`),
          api.get(`/user/${userId}`),
        ]);

        if (empRes.data?.data) setEmployees(empRes.data.data);
        if (userRes.data?.name) setUserName(userRes.data.name);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, [userId]);

  // Fetch existing advance salary (for edit mode)
  useEffect(() => {
    if (id) {
      const fetchAdvanceSalary = async () => {
        try {
          const res = await api.get(`/attendence/${id}`);
          const data = res.data?.data;
          if (data) {
            setValue("employee_id", data.employee_id);
            setValue("working_day", data.working_day);
            setValue("month", data.month);
            setValue("created_by", data.created_by);
          }
        } catch (err) {
          console.error("Error fetching salary data:", err);
          toast.error("Failed to load advance salary info!");
        }
      };
      fetchAdvanceSalary();
    }
  }, [id, id, setValue]);

  // Submit handler (Add or Update)
 const onSubmit = async (data) => {
  const payload = {
    employee_id: data.employee_id,
    working_day: data.working_day,
    month: data.month,
    created_by: userName,
  };

  try {
    const res = id
      ? await api.put(`/attendence/${id}`, payload)
      : await api.post(`/attendence`, payload)

    // Success check
    if (res?.data?.status === "Success") {
      toast.success(
        id
          ? "Attendence Updated Successfully!"
          : "Attendence Added Successfully!"
      );
      reset();
      navigate("/tramessy/HR/Payroll/Attendance");
      return;
    }

    // API returned something other than success
    toast.error(res?.data?.message || "Something went wrong!");
  } catch (err) {
    // Prevent duplicate toast if response exists
    if (!err.response) {
      toast.error("Failed to submit attendence!");
    }
    console.error("Error submitting form:", err);
  }
};

  return (
    <div className="p-2">
      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mx-auto p-6 border-t-2 border-primary rounded-md shadow space-y-4 max-w-3xl bg-white"
        >
          <h3 className="pb-4 text-primary font-semibold text-lg">
            {id
              ? "Update Atttendence Information"
              : "Add Attendence Information"}
          </h3>

          {/* Employee + Amount */}
          <div className="md:flex justify-between gap-3">
            <div className="w-full">
              <SelectField
                name="employee_id"
                label="Select Employee"
                required
                options={employees.map((emp) => ({
                  label: emp.employee_name || emp.email,
                  value: emp.id,
                }))}
                control={control}
              />
            </div>
            <div className="w-full">
              <InputField
                name="working_day"
                label="Working day"
                type="number"
                required
              />
            </div>
          </div>

          {/* Salary Month + Status */}
          <div className="md:flex justify-between gap-3">
            <div className="w-[50%]">
              <InputField
                name="month"
                label="Month(YYYY-MM)"
                placeholder="2025-09"
                required
              />
            </div>
          </div>

          {/* Created By (auto-filled) */}
          <div className="md:flex justify-between gap-3">
            <div className="w-full hidden">
              <InputField
                name="created_by"
                label="Created By"
                value={userName}
                readOnly
              />
            </div>
          </div>

          {/* Submit */}
          <BtnSubmit> {id ? "Update" : "Submit"}</BtnSubmit>
        </form>
      </FormProvider>
    </div>
  );
};

export default AdvanceSalaryForm;
