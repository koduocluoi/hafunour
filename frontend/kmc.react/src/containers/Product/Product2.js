
export default function Product() {
    const { id } = useParams();
    const history = useHistory();
    const [type, setType] = useState("");
    const [name, setName] = useState("");
    const [goldWeight, setGoldWeight] = useState(0);
    const [beadWeight, setBeadWeight] = useState(0);
    const [wage, setWage] = useState(0);
    const [price, setPrice] = useState(0);

    useEffect(() => {
        function loadProduct() {
            return API.get("kmc", `/products/${id}`);
        }

        async function onLoad() {
            try {
                const product = await loadProduct();
                const { type, name, goldWeight, beadWeight, wage, price } = product;

                // if (attachment) {
                //     product.attachmentURL = await Storage.vault.get(attachment);
                // }

                setType(type);
                setName(name);
                setGoldWeight(goldWeight);
                setBeadWeight(beadWeight);
                setWage(wage);
                setPrice(price);
            } catch (e) {
                onError(e);
            }
        }

        onLoad();
    }, [id]);

    function validateForm() {
        return
    }

}
