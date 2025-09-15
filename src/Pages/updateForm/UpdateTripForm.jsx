import BtnSubmit from "../../components/Button/BtnSubmit";
import { FormProvider, useForm } from "react-hook-form";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useEffect, useRef, useState } from "react";
import { FiCalendar } from "react-icons/fi";
import useRefId from "../../hooks/useRef";
import { InputField, SelectField } from "../../components/Form/FormFields";
import { useLoaderData, useNavigate } from "react-router-dom";

const updateTripForm = () => {
  const navigate = useNavigate();
  //   update loader data
  const updateTripLoaderData = useLoaderData();
  const {
    id,
    advance,
    body_fare,
    chada,
    challan,
    co_u,
    customer,
    date,
    dealer_name,
    distribution_name,
    do_si,
    driver_adv,
    driver_commission,
    driver_mobile,
    driver_name,
    due_amount,
    extra_fare,
    feri_cost,
    fuel_cost,
    callan_cost,
    others_cost,
    goods,
    labor,
    load_point,
    masking,
    model_no,
    night_guard,
    no_of_trip,
    parking_cost,
    per_truck_rent,
    police_cost,
    quantity,
    remarks,
    // road_cost,
    // sti,
    toll_cost,
    total_rent,
    transport_type,
    total_exp,
    unload_charge,
    unload_point,
    vat,
    vehicle_mode,
    vehicle_no,
    branch_name,
  } = updateTripLoaderData.data;
  const dateRef = useRef(null);
  const methods = useForm({
    defaultValues: {
      customer,
      transport_type,
      vehicle_no,
      driver_name,
      total_rent,
      total_exp, 
      branch_name,
      advance,
    due_amount,
    },
  });
  const { watch, handleSubmit, register, setValue, control } = methods;
  const selectedCustomer = watch("customer");
  const selectedTransport = watch("transport_type");

  // select customer from api
  const [customers, setCustomers] = useState([]);
  useEffect(() => {
    fetch(`${import.meta.env.VITE_BASE_URL}/customer/list`)
      .then((response) => response.json())
      .then((data) => setCustomers(data.data))
      .catch((error) => console.error("Error fetching customer data:", error));
  }, []);

  const customerOptions = customers.map((customer) => ({
    value: customer.customer_name,
    label: customer.customer_name,
  }));

  // select customer from api
  const [branch, setBranch] = useState([]);
  useEffect(() => {
    fetch(`${import.meta.env.VITE_BASE_URL}/office/list`)
      .then((response) => response.json())
      .then((data) =>{ setBranch(data.data)})
      .catch((error) => console.error("Error fetching customer data:", error));
  }, []);

  const branchOptions = branch.map((branch) => ({
    value: branch.branch_name,
    label: branch.branch_name,
  }));

  // select Vehicle No. from api
  const [vehicle, setVehicle] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  useEffect(() => {
    fetch(`${import.meta.env.VITE_BASE_URL}/vehicle/list`)
      .then((response) => response.json())
      .then((data) => {
        const options = data.data.map((dt) => ({
          value: `${dt.registration_zone} ${dt.registration_serial} ${dt.registration_number}`,
          label: `${dt.registration_zone} ${dt.registration_serial} ${dt.registration_number}`,
        }));

        setVehicle(options);
      })
      .catch((error) => console.error("Error fetching vehicle data:", error));
  }, []);

  // const vehicleOptions = vehicle.map((dt) => ({
  //   value: `${dt.registration_zone} ${dt.registration_serial} ${dt.registration_number} `,
  //   label: `${dt.registration_zone} ${dt.registration_serial} ${dt.registration_number} `,
  // }));
  // select driver from api
  const [drivers, setDrivers] = useState([]);
  useEffect(() => {
    fetch(`${import.meta.env.VITE_BASE_URL}/driver/list`)
      .then((response) => response.json())
      .then((data) => setDrivers(data.data))
      .catch((error) => console.error("Error fetching driver data:", error));
  }, []);

  const driverOptions = drivers.map((driver) => ({
    value: driver.driver_name,
    label: driver.driver_name,
    contact: driver.driver_mobile,
  }));

  // calculate Total Expense
  const driverCommision = parseFloat(watch("driver_commission") || 0);
  const roadCost = parseFloat(watch("road_cost") || 0);
  const labourCost = parseFloat(watch("labor") || 0);
  const parkingCost = parseFloat(watch("parking_cost") || 0);
  const guardCost = parseFloat(watch("night_guard") || 0);
  const tollCost = parseFloat(watch("toll_cost") || 0);
  const feriCost = parseFloat(watch("feri_cost") || 0);
  const policeCost = parseFloat(watch("police_cost") || 0);
  const chadaCost = parseFloat(watch("chada") || 0);
  const fuelCost = parseFloat(watch("fuel_cost") || 0);
  const callanCost = parseFloat(watch("callan_cost") || 0);
  const othersCost = parseFloat(watch("others_cost") || 0);

  const totalExpense =
    driverCommision +
    roadCost +
    labourCost +
    parkingCost +
    guardCost +
    tollCost +
    feriCost +
    policeCost +
    chadaCost+
    fuelCost +
    callanCost +
    othersCost;

  useEffect(() => {
    const total =
      driverCommision +
      roadCost +
      labourCost +
      parkingCost +
      guardCost +
      tollCost +
      feriCost +
      policeCost +
      chadaCost+
      fuelCost+
    callanCost+
    othersCost;
    setValue("total_exp", total);
  }, [
    driverCommision,
    roadCost,
    labourCost,
    parkingCost,
    guardCost,
    tollCost,
    feriCost,
    policeCost,
    chadaCost,
    fuelCost,
    callanCost,
    othersCost,
    setValue,
  ]);

// loader data theke value set
useEffect(() => {
  if (updateTripLoaderData?.data && selectedTransport === "vendor_transport") {
    setValue("total_exp", updateTripLoaderData.data.total_exp);
  }
}, [updateTripLoaderData, selectedTransport, setValue]);
  // calculate Total Expense of honda
  const noOfTrip = watch("no_of_trip") || 0;
  const perTruckRent = watch("per_truck_rent") || 0;
  const totalRentHonda = Number(noOfTrip) * Number(perTruckRent);
  // useEffect(() => {
  //   const total = Number(noOfTrip) * Number(perTruckRent);
  //   setValue("total_rent", total);
  // }, [noOfTrip, perTruckRent, setValue]);

  // post data on server
  const generateRefId = useRefId();

  // post data on server
  const onSubmit = async (data) => {
    console.log("purchase", data);
    const refId = generateRefId();
    try {
      const tripFormData = new FormData();
      // Append form fields
      for (const key in data) {
        tripFormData.append(key, data[key]);
      }
      // Additional fields
      tripFormData.append("ref_id", refId);
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/trip/update/${id}`,
        tripFormData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.success("Trip updated successfully!", { position: "top-right" });
       navigate("/tramessy/TripList")
    } catch (error) {
      console.error(error);
      const errorMessage =
        error.response?.data?.message || error.message || "Unknown error";
      toast.error("Server issue: " + errorMessage);
    }
  };
  return (
    <div className="md:p-2">
      <Toaster position="top-center" reverseOrder={false} />
      <h3 className="px-6 py-2 bg-primary text-white font-semibold rounded-t-md">
        Update Trip
      </h3>
      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-3 mx-auto bg-gray-100 rounded-md shadow"
        >
          <div className="border border-gray-300 p-3 md:p-5 rounded-b-md">
            <h5 className="text-3xl font-bold text-center text-[#EF9C07]">
              {selectedCustomer}
            </h5>
            {/* Common Input Fields */}
            <div>
              <div className="border border-gray-300 p-5 rounded-md mt-3">
                <h5 className="text-primary font-semibold text-center pb-5">
                  <span className="py-2 border-b-2 border-primary">
                    Customer and Destination
                  </span>
                </h5>
                <div className="mt-5 md:flex justify-between gap-3">
                  <div className="w-full">
                    <InputField
                      name="date"
                      label="Date"
                      type="date"
                      defaultValue={date}
                      inputRef={(e) => {
                        register("date").ref(e);
                        dateRef.current = e;
                      }}
                      icon={
                        <span
                          className="py-[11px] absolute right-0 px-3 top-[22px] transform -translate-y-1/2 bg-primary rounded-r"
                          onClick={() => dateRef.current?.showPicker?.()}
                        >
                          <FiCalendar className="text-white cursor-pointer" />
                        </span>
                      }
                    />
                  </div>
                  {/* Customer Dropdown */}
                  <div className="w-full relative">
                    <SelectField
                      name="customer"
                      label="Customer"
                      defaultValue={customer}
                      options={customerOptions}
                      control={control}
                    />
                  </div>
                  
                  <div className="w-full relative">
                    <SelectField
                      name="branch_name"
                      label="Branch"
                      defaultValue={branch_name}
                      options={branchOptions}
                      control={control}
                    />
                  </div>
                </div>
                <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
                  <div className="w-full">
                    <InputField
                      name="load_point"
                      label="Load Point"
                      defaultValue={load_point}
                    />
                  </div>
                  <div className="w-full">
                    <InputField
                      name="unload_point"
                      label="Unload Point"
                      defaultValue={unload_point}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Conditionally Show Yamaha Fields */}
            {selectedCustomer === "Yamaha" && (
              <div className="">
                <div className="border border-gray-300 p-5 rounded-md mt-3">
                  <h5 className="text-primary font-semibold text-center pb-5">
                    <span className="py-2 border-b-2 border-primary">
                      Transport and Driver section
                    </span>
                  </h5>
                  <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
                    <div className="w-full relative">
                      <SelectField
                        name="transport_type"
                        label="Transport Type"
                        defaultValue={transport_type}
                        options={[
                          { value: "own_transport", label: "Own Transport" },
                          {
                            value: "vendor_transport",
                            label: "Vendor Transport",
                          },
                        ]}
                      />
                    </div>
                    <div className="w-full">
                      <SelectField
                        name="vehicle_no"
                        label="Vehicle No."
                        value={selectedVehicle}
                        options={vehicle}
                        control={control}
                        onChange={(selected) => {
                          setSelectedVehicle(selected);
                        }}
                      />
                    </div>
                    <div className="w-full">
                      <SelectField
                        name="driver_name"
                        label="Driver Name"
                        defaultValue={driver_name}
                        control={control}
                        options={driverOptions}
                        onSelectChange={(selectedOption) => {
                          setValue(
                            "driver_mobile",
                            selectedOption?.contact || ""
                          );
                        }}
                      />
                    </div>
                  </div>
                  <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
                    <div className="w-full">
                      <InputField
                        name="driver_mobile"
                        label="Driver Mobile"
                        defaultValue={driver_mobile}
                      />
                    </div>
                    <div className="w-full">
                      <InputField
                        name="challan"
                        label="Challan"
                        defaultValue={challan}
                      />
                    </div>
                  </div>
                </div>
                <div className="border border-gray-300 p-5 rounded-md mt-3">
                  <h5 className="text-primary font-semibold text-center pb-5">
                    <span className="py-2 border-b-2 border-primary">
                      Product and Expense
                    </span>
                  </h5>
                  <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
                    <div className="w-full">
                      <InputField
                        name="model_no"
                        label="Model No."
                        defaultValue={model_no}
                      />
                    </div>
                    <div className="w-full">
                      <InputField
                        name="quantity"
                        label="Quantity"
                        defaultValue={quantity}
                      />
                    </div>
                  </div>

                  <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
                    <div className="w-full">
                      <InputField
                        name="total_rent"
                        label="Total Rent/Bill Amount"
                        type="number"
                        defaultValue={total_rent}
                      />
                    </div>
                    {/* <div className="w-full">
                      <InputField
                        name="fuel_cost"
                        label="Fuel Cost"
                        defaultValue={fuel_cost}
                      />
                    </div> */}
                    <div className="w-full">
                      <InputField
                        name="body_fare"
                        label="Body Fare"
                        defaultValue={body_fare}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Conditionally Show Hatim Fields */}
            {(selectedCustomer === "Hatim Pubail" ||
              selectedCustomer === "Hatim Rupgonj") && (
              <div className="border border-gray-300 p-5 rounded-md mt-3">
                <h5 className="text-primary font-semibold text-center pb-5">
                  <span className="py-2 border-b-2 border-primary">
                    Transport and Driver section
                  </span>
                </h5>
                <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
                  <div className="w-full relative">
                    <SelectField
                      name="transport_type"
                      label="Transport Type"
                      defaultValue={transport_type}
                      options={[
                        { value: "own_transport", label: "Own Transport" },
                        {
                          value: "vendor_transport",
                          label: "Vendor Transport",
                        },
                      ]}
                    />
                  </div>
                  <div className="w-full">
                    <SelectField
                      name="vehicle_no"
                      label="Vehicle No."
                      value={selectedVehicle}
                      options={vehicle}
                      control={control}
                      onChange={(selected) => {
                        setSelectedVehicle(selected);
                      }}
                    />
                  </div>
                  <div className="w-full">
                    <SelectField
                      name="driver_name"
                      label="Driver Name"
                      defaultValue={driver_name}
                      control={control}
                      options={driverOptions}
                      onSelectChange={(selectedOption) => {
                        setValue(
                          "driver_mobile",
                          selectedOption?.contact || ""
                        );
                      }}
                    />
                  </div>
                </div>{" "}
                <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
                  <div className="w-full">
                    <InputField
                      name="driver_mobile"
                      label="Driver Mobile"
                      defaultValue={driver_mobile}
                    />
                  </div>
                  <div className="w-full">
                    <InputField
                      name="challan"
                      label="Challan"
                      defaultValue={challan}
                    />
                  </div>
                  <div className="w-full">
                    <InputField
                      name="goods"
                      label="Goods"
                      defaultValue={goods}
                    />
                  </div>
                </div>
                <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
                  <div className="w-full">
                    <InputField
                      name="distribution_name"
                      label="Distribution Name"
                      defaultValue={distribution_name}
                    />
                  </div>
                  <div className="w-full">
                    <InputField
                      name="total_rent"
                      label="Total Rent/Bill Amount"
                      type="number"
                      defaultValue={total_rent}
                    />
                  </div>
                  <div className="w-full">
                    <InputField
                      name="remarks"
                      label="Remarks"
                      defaultValue={remarks}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Conditionally Show Suzuki Fields */}
            {selectedCustomer === "Suzuki" && (
              <div className="border border-gray-300 p-5 rounded-md mt-3">
                <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
                  <div className="w-full relative">
                    <SelectField
                      name="transport_type"
                      label="Transport Type"
                      defaultValue={transport_type}
                      options={[
                        { value: "own_transport", label: "Own Transport" },
                        {
                          value: "vendor_transport",
                          label: "Vendor Transport",
                        },
                      ]}
                    />
                  </div>
                  <div className="w-full">
                    <SelectField
                      name="vehicle_no"
                      label="Vehicle No."
                      value={selectedVehicle}
                      options={vehicle}
                      control={control}
                      onChange={(selected) => {
                        setSelectedVehicle(selected);
                      }}
                    />
                  </div>
                  <div className="w-full">
                    <InputField
                      name="dealer_name"
                      label="Dealer Name"
                      defaultValue={dealer_name}
                    />
                  </div>
                </div>
                <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
                  <div className="w-full">
                    <InputField
                      name="do_si"
                      label="Do(SI)"
                      defaultValue={do_si}
                    />
                  </div>
                  <div className="w-full">
                    <InputField name="co_u" label="CO(U)" defaultValue={co_u} />
                  </div>
                </div>
                <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
                  <div className="w-full">
                    <InputField
                      name="quantity"
                      label="Bike/Quantity"
                      defaultValue={quantity}
                    />
                  </div>
                  <div className="w-full">
                    <InputField
                      name="masking"
                      label="Masking"
                      defaultValue={masking}
                    />
                  </div>
                  <div className="w-full">
                    <InputField
                      name="unload_charge"
                      label="Unload Charge"
                      defaultValue={unload_charge}
                    />
                  </div>
                </div>
                <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
                  <div className="w-full">
                    <InputField
                      name="extra_fare"
                      label="Extra Fare"
                      defaultValue={extra_fare}
                    />
                  </div>
                  <div className="w-full">
                    <InputField
                      name="total_rent"
                      label="Total Rent/Bill Amount"
                      type="number"
                      defaultValue={total_rent}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Conditionally Show Honda Fields */}
            {selectedCustomer === "Honda" && (
              <div className="border border-gray-300 p-5 rounded-md mt-3">
                <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
                  <div className="w-full relative">
                    <SelectField
                      name="transport_type"
                      label="Transport Type"
                      defaultValue={transport_type}
                      options={[
                        { value: "own_transport", label: "Own Transport" },
                        {
                          value: "vendor_transport",
                          label: "Vendor Transport",
                        },
                      ]}
                    />
                  </div>
                  <div className="w-full">
                    <InputField
                      name="dealer_name"
                      label="Dealer Name"
                      defaultValue={dealer_name}
                    />
                  </div>
                  <div className="w-full">
                    <SelectField
                      name="vehicle_no"
                      label="Vehicle No."
                      value={selectedVehicle}
                      options={vehicle}
                      control={control}
                      onChange={(selected) => {
                        setSelectedVehicle(selected);
                      }}
                    />
                  </div>
                </div>
                <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
                  <div className="w-full">
                    <SelectField
                      name="driver_name"
                      label="Driver Name"
                      defaultValue={driver_name}
                      control={control}
                      options={driverOptions}
                      onSelectChange={(selectedOption) => {
                        setValue(
                          "driver_mobile",
                          selectedOption?.contact || ""
                        );
                      }}
                    />
                  </div>
                  <div className="w-full">
                    <InputField
                      name="driver_mobile"
                      label="Driver Mobile"
                      defaultValue={driver_mobile}
                    />
                  </div>
                </div>
                <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
                  <div className="w-full">
                    <InputField
                      name="do_si"
                      label="DO(SI)"
                      defaultValue={do_si}
                    />
                  </div>
                  <div className="w-full">
                    <InputField
                      name="no_of_trip"
                      label="No of Trip"
                      defaultValue={no_of_trip}
                    />
                  </div>
                  <div className="w-full">
                    <InputField
                      name="quantity"
                      label="Quantity"
                      defaultValue={quantity}
                    />
                  </div>
                </div>
                <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
                  <div className="w-full">
                    <InputField
                      name="vehicle_mode"
                      label="Vehicle Mode"
                      defaultValue={vehicle_mode}
                    />
                  </div>
                  <div className="w-full">
                    <InputField
                      name="per_truck_rent"
                      label="Per Truck Rent"
                      defaultValue={per_truck_rent}
                    />
                  </div>
                  <div className="w-full">
                    <InputField
                      name="total_rent"
                      label="Total Rent/Bill Amount"
                      type="number"
                      readOnly
                      defaultValue={total_rent}
                      // todo set default value
                      value={totalRentHonda}
                    />
                  </div>
                  <div className="w-full">
                    <InputField name="vat" label="Vat" defaultValue={vat} />
                  </div>
                </div>
              </div>
            )}
            {/* Conditionally Show Guest Fields */}
            {selectedCustomer === "Guest" && (
              <div className="border border-gray-300 p-5 rounded-md mt-3">
                <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
                  <div className="w-full relative">
                    <SelectField
                      name="transport_type"
                      label="Transport Type"
                      defaultValue={transport_type}
                      options={[
                        { value: "own_transport", label: "Own Transport" },
                        {
                          value: "vendor_transport",
                          label: "Vendor Transport",
                        },
                      ]}
                    />
                  </div>
                  <div className="w-full">
                    <SelectField
                      name="vehicle_no"
                      label="Vehicle No."
                      value={selectedVehicle}
                      options={vehicle}
                      control={control}
                      onChange={(selected) => {
                        setSelectedVehicle(selected);
                      }}
                    />
                  </div>
                </div>
                <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
                  <div className="w-[50%]">
                    <InputField
                      name="driver_name"
                      label="Driver Name"
                      defaultValue={driver_name}
                    />
                  </div>
                  {/* <div className="w-full">
                    <InputField
                      name="fuel_cost"
                      label="Fuel Cost"
                      defaultValue={fuel_cost}
                    />
                  </div> */}
                </div>
              </div>
            )}
            {/* transport type input field */}
            {selectedTransport === "own_transport" && (
              <div className="border border-gray-300 p-5 rounded-md mt-5">
                <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
                  <div className="w-full">
                    <InputField
                      name="driver_adv"
                      label="Driver Advance"
                      defaultValue={driver_adv}
                      type="number"
                    />
                  </div>
                  <div className="w-full">
                    <InputField
                      name="driver_commission"
                      label="Driver Commission"
                      defaultValue={driver_commission}
                      type="number"
                    />
                  </div>
                  <div className="w-full">
                    <InputField
                      name="labor"
                      label="Labour Cost"
                      type="number"
                      defaultValue={labor}
                    />
                  </div>
                  <div className="w-full">
                    <InputField
                      name="parking_cost"
                      label="Parking Cost"
                      type="number"
                      defaultValue={parking_cost}
                    />
                  </div>
                </div>
                <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
                  
                  <div className="w-full">
                    <InputField
                      name="night_guard"
                      label="Night Guard Cost"
                      type="number"
                      defaultValue={night_guard}
                    />
                  </div>
                  <div className="w-full">
                    <InputField
                      name="toll_cost"
                      label="Toll Cost"
                      type="number"
                      defaultValue={toll_cost}
                    />
                  </div>
                  <div className="w-full">
                    <InputField
                      name="feri_cost"
                      label="Feri Cost"
                      type="number"
                      defaultValue={feri_cost}
                    />
                  </div>
                   <div className="w-full">
                    <InputField
                      name="police_cost"
                      label="Police Cost"
                      type="number"
                      defaultValue={police_cost}
                    />
                  </div>
                </div>
                <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
                 
                  <div className="w-full">
                    <InputField
                      name="chada"
                      label="Chada"
                      type="number"
                      defaultValue={chada}
                    />
                  </div>
                  <div className="w-full">
          <InputField
            name="fuel_cost"
            label="Fuel Cost"
            type="number"
            defaultValue={fuel_cost}
          />
        </div>
        <div className="w-full">
          <InputField
            name="callan_cost"
            label="Callan Cost"
            type="number"
            defaultValue={callan_cost}
          />
        </div>
        <div className="w-full">
          <InputField
            name="others_cost"
            label="Others Cost"
            type="number"
            defaultValue={others_cost}
          />
        </div>

                  <div className="w-full">
                    <InputField
                      name="total_exp"
                      label="Total Expense"
                      readOnly
                      defaultValue={totalExpense}
                      value={totalExpense}
                    />
                  </div>
                </div>
              </div>
            )}
            {selectedTransport === "vendor_transport" && (
              <div className="border border-gray-300 p-5 rounded-md mt-5 md:mt-3 md:flex justify-between gap-3">
                <div className="w-full">
                  <InputField
                    name="total_exp"
                    label="Trip Rent"
                    defaultValue={total_exp}
                    type="number"
                  />
                </div>
                <div className="w-full">
                  <InputField
                    name="advance"
                    label="Advance"
                    defaultValue={advance}
                  />
                </div>
                <div className="w-full">
                  <InputField
                    name="due_amount"
                    label="Due Amount"
                    defaultValue={due_amount}
                  />
                </div>
              </div>
            )}
            {/* Submit Button */}
            <div className="text-left p-5">
              <BtnSubmit>Submit</BtnSubmit>
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default updateTripForm;
