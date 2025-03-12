import { Bar, BarChart, XAxis, YAxis, LabelList } from "recharts";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { useEffect, useState } from "react";
import { Spinner } from "../spinner";

const chartConfig = {
    value: {
        label: "Valor: ",
        color: "hsl(var(--chart-1))",
    },
} satisfies ChartConfig;

interface PedidosCotadosProps {
    dateIni: string | null;
    dateFin: string | null;
}

export const PedidosCotados: React.FC<PedidosCotadosProps> = ({
    dateIni,
    dateFin,
}) => {
    const [data, setData] = useState<any>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (dateIni && dateFin) {
            setLoading(true);
            const consulta = `
         SELECT 
            'PEDIDO' AS TIPO,
            COALESCE(COUNT(NUNOTA),0) AS RESULTADO
        FROM SANKHYA.AD_COTACAO
        WHERE STATUS = 4 
        AND CONVERT(DATE, DH_COTADO) BETWEEN '${dateIni}' AND '${dateFin}'

        UNION ALL

        SELECT 
        'VALOR' AS TIPO,
      COALESCE(SUM(TGFCAB.VLRNOTA),0) AS RESULTADO
        FROM SANKHYA.AD_COTACAO
        INNER JOIN SANKHYA.TGFCAB ON AD_COTACAO.NUNOTA = TGFCAB.NUNOTA
        WHERE AD_COTACAO.STATUS = 4 
        AND CONVERT(DATE, AD_COTACAO.DH_COTADO) BETWEEN '${dateIni}' AND '${dateFin}'

        UNION ALL

        SELECT 
            'PESO_BRUTO' AS TIPO,
           
                COALESCE((SELECT SUM(PESOBRUTO)
                FROM (
                    SELECT DISTINCT TGFCAB.PESOBRUTO
                    FROM SANKHYA.TGFCAB
                    WHERE TGFCAB.NUNOTA IN (
                        SELECT NUNOTA
                        FROM SANKHYA.AD_COTACAO
                        WHERE STATUS = 4
                        AND CONVERT(DATE, DH_COTADO) BETWEEN '${dateIni}' AND '${dateFin}'
                    )
                ) AS SubQuery
                ),0) AS RESULTADO
        ORDER BY RESULTADO DESC;
        `;

            JX.consultar(consulta).then((data: any) => {
                setData(data);
            }).catch((err: any) => {
                console.error(err);
            }).finally(() => {
                setLoading(false)
            });
        }

    }, [dateIni, dateFin]);

    const chartData = data
        .map((item: any) => ({
            opcao: item.TIPO === "PEDIDO" ? "Pedidos" :
                item.TIPO === "VALOR" ? "Valor NF" :
                    item.TIPO === "PESO_BRUTO" ? "Peso Bruto" : item.TIPO,
            value: parseFloat(item.RESULTADO)
        }))
        .sort((a: any, b: any) => b.value - a.value);

    return (
        <Card>
            <CardHeader>
                <CardTitle>PEDIDOS COTADOS</CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center items-center">
                        <Spinner />
                    </div>
                ) : (
                    <ChartContainer config={chartConfig} className="h-52">
                        <BarChart
                            accessibilityLayer
                            data={chartData}
                            layout="vertical"
                            margin={{ top: 10, right: 100, left: 10, bottom: 10 }}
                        >
                            <XAxis type="number" dataKey="value" hide />
                            <YAxis
                                dataKey="opcao"
                                type="category"
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => value.slice(0, 10)}
                            />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent hideLabel />}
                            />
                            <Bar
                                dataKey="value"
                                fill="var(--color-value)"
                                radius={5}
                                minPointSize={1}
                            >
                                <LabelList
                                    dataKey="value"
                                    position="right"
                                    dx={1}
                                    style={{ fill: 'black', fontWeight: 'bold' }}
                                    formatter={(value: number) => {
                                        return new Intl.NumberFormat('pt-BR', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        }).format(value);
                                    }}
                                />
                            </Bar>
                        </BarChart>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    );
};
