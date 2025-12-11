import React from "react";
import { Card, Form, Input, Button, message } from "antd";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const Register: React.FC = () => {
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    try {
      const resp = await api.post("/auth/register", {
        firstName: values.firstName,
        lastName: values.lastName,
        nationalCode: values.nationalCode,
        phone: values.phone,
        password: values.password,
      });

      message.success("ثبت‌نام با موفقیت انجام شد. اکنون وارد شوید.");
      navigate("/login"); // ✔ انتقال صحیح

    } catch (err: any) {
      message.error(err?.response?.data?.error ?? "خطا در ثبت‌نام");
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: 60 }}>
      <Card style={{ width: 600 }}>
        <h2 style={{ marginBottom: 20 }}>ثبت‌نام</h2>

        <Form onFinish={onFinish} layout="vertical">

          <Form.Item label="نام" name="firstName"
            rules={[{ required: true, message: "نام را وارد کنید" }]}>
            <Input />
          </Form.Item>

          <Form.Item label="نام خانوادگی" name="lastName"
            rules={[{ required: true, message: "نام خانوادگی را وارد کنید" }]}>
            <Input />
          </Form.Item>

          <Form.Item
            label="کد ملی"
            name="nationalCode"
            rules={[
              { required: true, message: "کد ملی را وارد کنید" },
              {
                pattern: /^[0-9]{10}$/,
                message: "کد ملی باید ۱۰ رقم باشد",
              },
            ]}
          >
            <Input maxLength={10} />
          </Form.Item>

          <Form.Item
            label="شماره موبایل"
            name="phone"
            rules={[
              { required: true, message: "شماره موبایل را وارد کنید" },
              {
                pattern: /^09[0-9]{9}$/,
                message: "شماره موبایل نامعتبر است",
              },
            ]}
          >
            <Input maxLength={11} />
          </Form.Item>

          <Form.Item
            label="رمز عبور"
            name="password"
            rules={[
              { required: true, message: "رمز عبور را وارد کنید" },
              { min: 6, message: "حداقل ۶ کاراکتر" },
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
              ثبت‌نام
            </Button>
          </Form.Item>

        </Form>
      </Card>
    </div>
  );
};

export default Register;
