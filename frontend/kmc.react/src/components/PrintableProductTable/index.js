import React from "react";
import { Table } from "react-bootstrap";
import "./index.css";

export default function PrintableProductTable({
    className = "",
    data = [],
    ...props
}) {
    function renderProductRows(data) {
        return [].concat(data).map((product, i) => (
            <tr key={i + 1}>
                <td> {product.productId || ""} </td>
                <td> {product.type || ""} </td>
                <td> {product.name || ""} </td>
                <td> {product.goldWeight || 0} </td>
                <td> {product.beadWeight || 0} </td>
                <td> {product.wage || 0} </td>
                <td> {product.goldPrice || 0} </td>
                <td> {product.totalPrice || 0} </td>
            </tr>
        ));
    }

    return (
        <Table striped bordered condensed hover responsive>
            <thead>
                <tr>
                    <th width='10%'> Mã </th>
                    <th width='7%'> Loại </th>
                    <th> Tên hàng </th>
                    <th width='10%'> TL vàng </th>
                    <th width='10%'> TL hột </th>
                    <th width='13%'> Tiền công </th>
                    <th width='10%'> Đơn giá </th>
                    <th width='15%'> Thành tiền </th>
                </tr>
            </thead>
            <tbody>
                {renderProductRows(data)}
            </tbody>
        </Table>
    );
};
