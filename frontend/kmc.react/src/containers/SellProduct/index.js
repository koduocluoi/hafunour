import React, {useEffect, useState} from "react";
import {Form, FormGroup, FormControl, ControlLabel} from "react-bootstrap";
import { API, Storage } from "aws-amplify";
import { onError } from "../../libs/errorLib";
import "./index.css";
import { useFormFields } from "../../libs/hooksLib";
import ColoredLine from "../../components/ColoredLine";
import EditableProductPage from "../../components/EditableProductPage"
import LoaderButton from "../../components/LoaderButton/LoaderButton";

export default function SellProduct() {

    const [fields, handleFieldChange] = useFormFields({
        productId: "",
    });
    const [productId, setProductId] = useState('');
    const [product, setProduct] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [attachmentUrls, setAttachmentUrls] = useState([]);

    // function loadProduct() {
    //     return API.get("kmc", `/products/${productId}`);
    // }
    //
    // async function getUrls(attachments) {
    //     var urls = [];
    //     for (var i = 0; i < attachments.length; i++) {
    //         const url = await Storage.vault.get(attachments[i]);
    //         urls.push(url);
    //     }
    //
    //     return urls;
    // }
    //
    // async function onLoad() {
    //     try {
    //         const response = await loadProduct();
    //         if (response.code != '200') {
    //             onError(response.message);
    //             return;
    //         } else {
    //             const {attachments} = response.product;
    //             if (attachments != null) {
    //                 setAttachmentUrls(await getUrls(attachments));
    //             } else {
    //                 setAttachmentUrls([]);
    //             }
    //             setProduct(response.product);
    //             setIsLoadingData(false);
    //         }
    //     } catch (e) {
    //         onError(e);
    //     }
    // }

    function handleEnterProductId(event) {
        event.preventDefault();
        setProductId(fields.productId);
        // if (productId == '' || productId == null) {
        //     setIsLoadingData(true);
        // } else {
        //     onLoad();
        // }
    }

    useEffect(() => {
        function loadProduct() {
            return API.get("kmc", `/products/${productId}`);
        }

        async function getUrls(attachments) {
            var urls = [];
            for (var i = 0; i < attachments.length; i++) {
                const url = await Storage.vault.get(attachments[i]);
                urls.push(url);
            }

            return urls;
        }

        async function onLoad() {
            try {
                const response = await loadProduct();
                if (response.code != '200') {
                    onError(response.message);
                    return;
                } else {
                    const {attachments} = response.product;
                    if (attachments != null) {
                        setAttachmentUrls(await getUrls(attachments));
                    } else {
                        setAttachmentUrls([]);
                    }
                    setProduct(response.product);
                    setIsLoadingData(false);
                }
            } catch (e) {
                onError(e);
            }
        }

        if (productId == '' || productId == null) {
            setIsLoadingData(true);
        } else {
            onLoad();
        }
    }, [productId]);

    return (
        <div className="SellProduct">
            <form onSubmit={handleEnterProductId}>
                <FormGroup controlId="productId">
                    <ControlLabel> Mã hàng </ControlLabel>
                    <FormControl
                        type="text"
                        value={fields.productId}
                        onChange={handleFieldChange}
                        placeholder="Nhập mã hàng "
                    />
                </FormGroup>
            </form>
            {!isLoadingData
                ? <div>
                    <ColoredLine color="grey" height={2}/>
                    <EditableProductPage
                        attachmentUrls={attachmentUrls}
                        product={product}
                        isForPrint={true}
                    />
                </div>
                : <div></div>
            }
        </div>
    )
}
