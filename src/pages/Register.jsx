// import { useState } from 'react';
import { UserOutlined, MailOutlined, KeyOutlined } from '@ant-design/icons';
import { Form, Input, Select, Button } from 'antd';
import { registerUser, verifyEmail } from '../firebase/auth.js';
import { auth, db } from '../firebase/firebaseConfig';
import swal from 'sweetalert';
import { addCollection } from '../firebase/firestore'

function Register() {
    const [form] = Form.useForm();
    const { Option } = Select;

    const onFinish = (values) => {
        registerUser(auth, values.email, values.password)
        .then((userCredential) => {
            const user = {
                name: values.username,
                email: values.email,
                description: '',
                photo: '',
                job: values.job,
            };
            addCollection(db, 'user', user);
            verifyEmail(userCredential.user);
            swal({
                title: '¡Registrado Correctamente!',
                text: 'Por favor verifica tu correo electrónico',
                icon: 'success',
                button: 'Ok'
            })
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            throw new Error(errorCode, errorMessage);
        });
    };

    return (
      <div className="ant-row form-container form-register">
          <div className="img-burger ant-col ant-col-sm-0 ant-col-xl-10"> </div>
          <div className="ant-col-xl-3"> </div>
          <Form
              layout='vertical'
        className="form ant-col-xs-24 ant-col-sm-24 ant-col-md-24 ant-col-lg-16 ant-col-xl-11 form"
              autoComplete="off"
              form={form}
              name="register"
              onFinish={onFinish}
              scrollToFirstError
              >

              <Form.Item
                  label="Nombre de usuario"
                  name="username"
                  rules={[
                      { required: true, 
                          message: 'Por favor, introduce tu nombre de usuario' 
                      }
                  ]}
                  >
                  <Input
                      placeholder="Introduce tu nombre completo"
                      prefix={ <UserOutlined/> }
                  />
              </Form.Item>


              <Form.Item
                  name="email"
                  label="Correo Electrónico"
                  rules={[
                  {
                      type: 'email',
                      message: 'Correo Electrónico inválido',
                  },
                  {
                      required: true,
                      message: 'Por favor ingrese su Correo Electrónico!',
                  },
                  ]}
                  >
                  <Input 
                  placeholder="Introduce tu correo electrónico"
                  prefix={ <MailOutlined/> }
                  />
              </Form.Item>

              <Form.Item
                  name="password"
                  label="Contraseña"
                  rules={[
                  {
                      required: true,
                      message: 'Por favor ingrese su contraseña',
                  },
                  ]}
                  hasFeedback
                  >
                  <Input.Password
                      placeholder="Introduce tu contraseña"
                      prefix={ <KeyOutlined/> }
                  />
              </Form.Item>

              <Form.Item
                  name="confirm"
                  label="Confirmar Contraseña"
                  dependencies={['password']}
                  hasFeedback
                  rules={[
                  {
                      required: true,
                      message: 'Por favor confirme su contraseña',
                  },
                  ({ getFieldValue }) => ({
                      validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                      }

                      return Promise.reject(new Error('¡Las dos contraseñas que ingresó no coinciden!'));
                      },
                  }),
                  ]}
                  >
                  <Input.Password 
                      placeholder="Confirma tu contraseña"
                      prefix={ <KeyOutlined/> }
                  />
              </Form.Item>

              <Form.Item
                  name="job"
                  label="Cargo"
                  rules={[
                  {
                      required: true,
                      message: 'Por favor seleccione su cargo',
                  },
                  ]}
                  >
                  <Select placeholder="Seleccione su cargo...">
                  <Option value="mesero">Mesero</Option>
                  <Option value="cocina">Jefe de cocina</Option>
                  </Select>
              </Form.Item>

              <Form.Item >
                  <Button htmlType="submit" className="form-button">
                  REGISTRARSE
                  </Button>
              </Form.Item>

              <Form.Item>
                  <p className='text-white'>¿Ya estás registrado?</p>
                  <a href="/" className='text-orange'>Inicia Sesión</a>
              </Form.Item>

          </Form>            
      </div>
    )
}

export default Register
