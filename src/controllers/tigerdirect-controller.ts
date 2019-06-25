import { tigerDirectBL } from "../bl";

export async function getAllReviews(req, res) {
    if (!req.query.productId) {
        res.status(200).send({ error: true, message: "please provide a product id", result: null });
        return;
    }
    try {
        console.log("Review request for productId: " + req.query.productId);
        let result = await tigerDirectBL.getAllReviews(req.query.productId);
        return res.status(200).send({ error: false, message: "success", result });
    } catch (e) {
        console.error(e);
        res.status(200).send({ error: true, message: "unable to fetch reviews", result: null });
    }
}