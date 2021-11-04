import { useState, useEffect } from 'react';
import 'antd/dist/antd.css';
import '../css/orderForm.css';
import { serverTimestamp, updateDoc } from 'firebase/firestore';
import { querySnapshot, addCollection, updateCollection } from '../firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import swal from 'sweetalert';
import GetSnapshotOrderly from '../helpers/GetSnapshotOrderly';
import {
  Form,
  Input,
  Select,
  Card,
  Divider,
  Button, 
  Row, 
  Col
} from 'antd';
import {
  PlusCircleOutlined,
  MinusCircleOutlined,
  DeleteOutlined
} from '@ant-design/icons';

const OrderForm = ({handleDeleteProduct, handleMinusProduct, handlePlusProduct, ...props}) => {

  const [form] = Form.useForm();
  const { Option } = Select;
  const [tables, setTables] = useState([]); // Traer mesas disponibles

  //----------------------------- Traer colleción de ordenes -------------------------------//
  const orderedCollection = GetSnapshotOrderly('orders', 'time', 'asc');
  const orders = [];
  orderedCollection.forEach(doc => orders.push(doc));

  //----------------------------- Traer mesas disponibles -------------------------------//
  const getTables = async () => {
    const data = await querySnapshot(db, "tables");
    return data.docs.map((doc) => ({id: doc.id, docdata : doc.data()}))
  };

  useEffect(() => {
    getTables().then((orderArray) => setTables(orderArray))
  }, []);

  //---------------------------- Enviar una orden a firestore ----------------------------//
  const selectedProductsArray = props.selectedProductsArray;
  const selectedProductsID = () => selectedProductsArray.map(product => ({
    name: product.name,
    price: product.price,
    id: product.id, 
    quantity: product.quantity,
    type: product.type === undefined ? "" : product.type,
    }));
  const total = () => selectedProductsArray.reduce((acc, current )=> acc + (current.price * current.quantity), 0) //Total de la cuenta
  const subTotal = Math.round(total() / 1.18).toFixed(2);
  const tax = Math.round(subTotal* 0.18).toFixed(2);

  //--------------------------- Leer los valores del Formulario  ---------------------------//
  const onFinish = async (values) => {
    if (total() === 0 ) {

      swal({
        text: "Por favor agrega un producto",
        icon: "error",
        button: "ok",
      })

    } else {
      //----------------------------- Actualizar mesas ocupadas -------------------------------//
        const tablesToFalse = tables.map(table => 
          table.id === values.table ? {  ...table, docdata : {table: table.docdata.table, status : false } } : table
        )
        setTables([...tablesToFalse]) //Actualiza en DOM

        const availableTables = updateCollection(db, 'tables', values.table) 
        await updateDoc(availableTables, {  //Actualiza en Firestore
          status: false 
        });

      const newOrderObject = {
        numberOrder: orders.length,
        client: values.clientname,
        order: selectedProductsID(),
        other: values.message === undefined ? "" :  values.message,
        status: 'preparing',
        table: values.table,
        subtotal: subTotal,
        tax: tax,
        total: total(),
        time: serverTimestamp(),
        waitTime : ""
      };

      addCollection(db, 'orders', newOrderObject)
      
      //----------------------- Limpiar los datos del Formulario al enviar ----------------------------//
      form.resetFields()
      props.setSelectedProductsArray([])

      swal({
        text: "La orden ha sido enviada a la cocina",
        icon: "success",
        button: "ok",
      })
    }
  };

  //--------------------------- Limpiar datos del formulario en cancel ---------------------------//
  const handleCancel = () => {
    props.setSelectedProductsArray([]);
  }

  
  return (
    <div className="site-card-border-less-wrapper order-list">
      <Card title="RESUMEN DE PEDIDO" bordered={false} style={{textAlign: 'center', borderRadius: '15px' }} className='card-create-order'>
        <Form
            className='form-create-order'
            layout='vertical'
            autoComplete="off"
            form={form}
            name="createOrder"
            onFinish={onFinish}
            scrollToFirstError
            >
          <p style={{ textAlign: 'left', color: '#F5F5F6', fontSize: "16px", fontWeight: "bold" }}> Número de orden: 0000{orders.length} </p>
          <Form.Item
            style={{ width: 180}}
            name="table" 
            rules={[
            {
                required: true,
                message: 'Por favor seleccione una mesa',
            },
            ]}
            >
            <Select placeholder="Mesas disponibles...">
              {
                tables.map((table) => (
                  <Option key={table.id} className='option-select' value={table.id} disabled={table.docdata.status ? false: true}>{table.docdata.table} </Option>
                ))
              }

            </Select>
          </Form.Item>

          <Form.Item
            label="Nombre del cliente:" name="clientname"
            rules={[
                { required: true, 
                    message: 'Por favor, introduce tu nombre del cliente.' 
                }
            ]}
            >
            <Input
                placeholder="Introduce el nombre del cliente..."
                style={{height: '45px'}}
            />
          </Form.Item>

          <div className="order-client">
          {selectedProductsArray.length === 0 ? <h3 style={{ color: "#b5b5b5" }}> No hay productos agregados en la orden todavía... </h3> : null}
          {
            selectedProductsArray.map(product => {
              return (
                <Row style={{ color: 'white' }}
                key={product.id}
                >
                  <Col xl={12} md={12} sm={12} xs={12} className="product-name"> {product.name} { product.type? product.type : null}</Col>
                  <Col xl={2} md={2} sm={2} xs={2}  >  <MinusCircleOutlined   className="product-icon" style={{ fontSize: '110%'}} onClick={() => handleMinusProduct(product)} /> </Col>
                  <Col  xl={3} md={3} sm={3} xs={3} > {product.quantity} </Col>
                  <Col xl={2} md={2} sm={2} xs={2}  > <PlusCircleOutlined  className="product-icon" style={{ fontSize: '110%'}}  onClick={() => handlePlusProduct(product)} /> </Col>
                  <Col  xl={3} md={3} sm={3} xs={3}  > {'s/' + product.quantity * product.price} </Col>
                  <Col xl={2} md={2} sm={2} xs={2}  > <DeleteOutlined className="product-icon-delete" style={{ cursor: 'pointer', fontSize: '120%'}} onClick={() => handleDeleteProduct(product)}  /> </Col>
                </Row>
              )
            }
            )
          }
          </div> 

          <Form.Item name="message" label="Nota especial para el chef:" style={{ margin: '50px'}}>
            <Input.TextArea showCount maxLength={100}/>
          </Form.Item>

          <Divider style={{ background: "white" }} />

          <div className="sub-total" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px', color: "#F5F5F6"}}>
            <p className="title"> Sub Total</p>
            <p className="title"> {'s/' + subTotal} </p>
          </div>

          <div className="tax" style={{ display: 'flex', justifyContent: 'space-between', color: "#F5F5F6"}}>
            <p className="title"> Impuesto </p>
            <p className="title"> {'s/' + tax} </p>
          </div>

          <div className="total" style={{ display: 'flex', justifyContent: 'space-between', color: "#F5F5F6" }}>
            <p className="title" style={{ fontWeight: 'bold'}}> Total </p>
            <p className="title" style={{ fontWeight: 'bold'}}> {'s/' + total().toFixed(2)} </p>
          </div>
     
          <Form.Item >
            <Button ghost htmlType="reset" onClick={handleCancel} style={{ width: "45%", marginRight: "10%", height: 50, borderRadius: 15, fontWeight: 'bold', fontSize: 16}}>
              CANCELAR
            </Button>

            <Button htmlType="submit" className="form-button" style={{ width: "45%" }}>
              CREAR ORDEN
            </Button>
          </Form.Item>
        </Form>  
      </Card>
    </div>
  )
}

export default OrderForm;