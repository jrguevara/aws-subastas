import { obtenerSubastasFinalizadas } from "../../lib/obtenerSubastasFinalizadas";
import { cerrarSubasta } from "../../lib/cerrarSubasta";
import createError from "http-errors";

const procesarSubastas = async (event, context) => {

    try {
        const subastasPorFinalizar = await obtenerSubastasFinalizadas();
        const cerrasPromesas = subastasPorFinalizar.map(subasta => cerrarSubasta(subasta));
        await Promise.all(cerrasPromesas);

        return { 'subastas cerradas': cerrasPromesas.length };
    } catch (error) {
        console.error(error);
        throw new createError.InternalServerError(error);
    }
}

export const handler = procesarSubastas;