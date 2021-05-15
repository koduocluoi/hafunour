import React, { useRef, useState, useEffect } from "react";
import { API, Storage } from "aws-amplify";
import { useHistory } from "react-router-dom";
import { FormGroup, FormControl, ControlLabel } from "react-bootstrap";
import LoaderButton from "../../components/LoaderButton/LoaderButton";
import { onError } from "../../libs/errorLib";
import { s3Upload } from "../../libs/awsLib";
import { useFormFields } from "../../libs/hooksLib";
import config from "../../config";
import "./index.css";

export default function EditableProductPage({
    product = {},
    attachmentUrls = [],
    isEdit = false,
    isForPrint = false,
    ...props
}) {
    const files = useRef({current: []});
    const history = useHistory();
    const [isLoading, setIsLoading] = useState(false);
    const [fileUrls, setFileUrls] = useState(attachmentUrls);

    const [fields, handleFieldChange] = useFormFields({
        productId: product.productId || "",
        type: product.type || "",
        name: product.name || "",
        goldWeight: product.goldWeight || "",
        beadWeight: product.beadWeight || "",
        wage: product.wage || "",
        goldPrice: "",
        reducedPrice: "",
    });

    function getUrls(files) {
        let urls = [];
        for (var i = 0; i < files.current.length; i++) {
            urls.push(URL.createObjectURL(files.current[i]));
        }
        return urls;
    }

    // useEffect(() => {
    //     fields.productId = product.productId || "";
    //     fields.type = product.type || "" ;
    //     fields.name = product.name || "";
    //     fields.goldWeight = product.goldWeight || "";
    //     fields.beadWeight = product.beadWeight || "";
    //     fields.wage = product.wage || "" ;
    // }, [product])

    function validateForm() {
        return (
            fields.productId.length > 0
            && fields.name.length > 0
            && fields.type.length > 0
            && (!isForPrint
                || (fields.goldPrice.length > 0 && fields.reducedPrice.length > 0))
        );
    }

    function validateFiles(files) {
        var err = "";

        if (files.length > 5) {
            err = err + "1 sản phẩm chỉ được 5 files hình ảnh";
        }

        for (var i = 0; i < files.length; i++) {
            if (files[i].size > config.MAX_ATTACHMENT_SIZE) {
                err = err +
                    `\nHãy chọn file ảnh nhẹ hơn ${config.MAX_ATTACHMENT_SIZE /
                        1000000} MB.`
                return;
            }
        };

        return err;
    }

    function handleFileChange(event) {
        files.current = event.target.files;

        setFileUrls(getUrls(files));
    }

    function getProductFields() {
        return {
            productId: fields.productId,
            name: fields.name,
            type: fields.type,
            goldWeight: fields.goldWeight,
            beadWeight: fields.beadWeight,
            wage: fields.wage,
        }
    }

    function getSellFields() {

        function getTotalPrice(goldWeight, wage, reducedPrice, goldPrice) {
            return String((parseFloat(goldWeight.split(" ")[0]) * parseFloat(goldPrice)) + parseFloat(wage) - parseFloat(reducedPrice));
        }

        return {
            productId: fields.productId,
            name: fields.name,
            type: fields.type,
            goldWeight: fields.goldWeight,
            beadWeight: fields.beadWeight,
            wage: fields.wage,
            reducedPrice: fields.reducedPrice,
            goldPrice: fields.goldPrice,
            totalPrice: getTotalPrice(
                fields.goldWeight,
                fields.wage,
                fields.reducedPrice,
                fields.goldPrice
            )
        }
    }

    async function handleAddProduct() {
        try {
            var attachments = []
            for (var i = 0; i < files.current.length; i++) {
                const attachment = await s3Upload(files.current[i], `${fields.productId}-${i}`);
                attachments.push(attachment);
            }

            const response = await addProduct({
                ...getProductFields(),
                attachments
            });

            if (response.code != '200') {
                onError(response.message);
                setIsLoading(false);
            } else {
                history.push("/");
            }
        } catch (e) {
            onError(e);
            setIsLoading(false);
        }
    }

    async function handleUpdateProduct() {
        try {
            var attachments = [];

            if (files.current.length === 0) {
                for (var i = 0; i < files.current.length; i++) {
                    const attachment = await s3Upload(files.current[i], `${fields.productId}-${i}`);
                    attachments.push(attachment);
                }
            } else {
                attachments = product.attachments;
            }

            var response = await updateProduct({
                ...getProductFields(),
                attachments
            });

            if (response.code != '200') {
                onError(response.message);
                setIsLoading(false);
            } else {
                history.push("/");
            }
        } catch (e) {
            onError(e);
            setIsLoading(false);
        }
    }

    async function handleSellProduct() {
        try {
            var attachments = [];

            if (files.current.length === 0) {
                for (var i = 0; i < files.current.length; i++) {
                    const attachment = await s3Upload(files.current[i], `${fields.productId}-${i}`);
                    attachments.push(attachment);
                }
            } else {
                attachments = product.attachments;
            }

            var response = await sellProduct({
                ...getSellFields(),
                attachments
            });

            if (response.code != '200') {
                onError(response.message);
                return;
            } else {
                history.push(`/checkout/${response.historyId}`);
            }
        } catch (e) {
            onError(e);
            setIsLoading(false);
        }
    }

    async function handleSubmit(event) {
        event.preventDefault();

        const err = validateFiles(files.current);

        if (err != "") {
            alert(err);
            return;
        }

        setIsLoading(true);

        if (isEdit) {
            handleUpdateProduct();
        } else if (isForPrint) {
            // await handleUpdateProduct();
            handleSellProduct();
        } else {
            handleAddProduct();
        }

        setIsLoading(false);
    }

    function displayImageReviews(urls) {
        return urls.map((url, index) => (<img key={index} src={url}/>));
    }

    async function addProduct(product) {
        return API.post("kmc", "/products", {
            body: product
        });
    }

    async function updateProduct(product) {
        return API.put("kmc", `/products/${product.productId}`, {
            body: product
        });
    }

    async function sellProduct(product) {
        return API.post("kmc", `/products/${product.productId}/sell`, {
            body: product
        });
    }

    return (
        <div className="EditableProductPage">
            <form onSubmit={handleSubmit}>
                <FormGroup controlId="productId">
                    <ControlLabel> Mã hàng </ControlLabel>
                    <FormControl
                        type="text"
                        value={fields.productId}
                        onChange={handleFieldChange}
                        placeholder="Nhập mã hàng"
                        disabled={isForPrint}
                    />
                </FormGroup>
                <FormGroup controlId="type">
                    <ControlLabel> Loại sản phẩm </ControlLabel>
                    <FormControl
                        type="text"
                        value={fields.type}
                        onChange={handleFieldChange}
                        placeholder="Nhập loại sản phẩm"
                    />
                </FormGroup>
                <FormGroup controlId="name">
                    <ControlLabel> Tên hàng </ControlLabel>
                    <FormControl
                        type="text"
                        value={fields.name}
                        onChange={handleFieldChange}
                        placeholder="Nhập tên hàng"
                    />
                </FormGroup>
                <FormGroup controlId="goldWeight">
                    <ControlLabel> Trọng lượng vàng </ControlLabel>
                    <FormControl
                        type="text"
                        value={fields.goldWeight}
                        onChange={handleFieldChange}
                        placeholder="Nhập trọng lượng vàng"
                    />
                </FormGroup>
                <FormGroup controlId="beadWeight">
                    <ControlLabel> Trọng lượng hột </ControlLabel>
                    <FormControl
                        type="text"
                        value={fields.beadWeight}
                        onChange={handleFieldChange}
                        placeholder="Nhập trọng lượng hột"
                    />
                </FormGroup>
                <FormGroup controlId="wage">
                    <ControlLabel> Tiền công </ControlLabel>
                    <FormControl
                        type="text"
                        value={fields.wage}
                        onChange={handleFieldChange}
                        placeholder="Nhập tiền công"
                    />
                </FormGroup>
                {isForPrint
                    ? <div>
                        <FormGroup controlId="goldPrice">
                        <ControlLabel> Giá vàng </ControlLabel>
                            <FormControl
                                type="text"
                                value={fields.goldPrice}
                                onChange={handleFieldChange}
                                placeholder="Nhập giá vàng"
                            />
                        </FormGroup>
                        <FormGroup controlId="reducedPrice">
                        <ControlLabel> Số tiền giảm </ControlLabel>
                            <FormControl
                                type="text"
                                value={fields.reducedPrice}
                                onChange={handleFieldChange}
                                placeholder="Nhập số tiền giảm"
                            />
                        </FormGroup>
                    </div>
                    : <div></div>
                }
                <FormGroup controlId="file">
                    <ControlLabel>Ảnh sản phẩm</ControlLabel>
                    <FormControl onChange={handleFileChange} type="file" multiple />
                </FormGroup>
                <div className="imagePreview">
                    {displayImageReviews(fileUrls)}
                </div>
                <LoaderButton
                    block
                    type="submit"
                    bsSize="large"
                    bsStyle="primary"
                    isLoading={isLoading}
                    disabled={!validateForm()}
                >
                    {isEdit ? "Cập nhật sản phẩm" : "Thêm sản phẩm"}
                </LoaderButton>
            </form>
        </div>
    );
}
