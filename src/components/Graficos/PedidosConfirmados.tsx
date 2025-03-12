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
import { Bar, BarChart, LabelList, XAxis, YAxis } from "recharts";


const chartConfig = {
    value: {
        label: "Valor:",
        color: "hsl(var(--chart-1))",
    },
} satisfies ChartConfig;

interface PedidosConfirmadosProps {
    dateIni: string | null;
    dateFin: string | null;
}



export const PedidosConfirmados: React.FC<PedidosConfirmadosProps> = ({
    dateIni,
    dateFin,
}) => {
    const [data, setData] = useState<any>([]);

    useEffect(() => {
        if (dateIni && dateFin) {
            const consulta = `
            SELECT 
                'PEDIDO' AS TIPO,
                COALESCE(COUNT(TGFCAB.NUNOTA),0) AS RESULTADO
                FROM TGWSEP SEP
                INNER JOIN TGWSXN ON TGWSXN.NUSEPARACAO = SEP.NUSEPARACAO
                INNER JOIN TGFCAB ON TGWSXN.NUNOTA = TGFCAB.AD_PEDDESTINO
                INNER JOIN AD_COTACAO ON AD_COTACAO.NUNOTA = TGFCAB.NUNOTA 
                WHERE 
                CONVERT(DATE, AD_COTACAO.DH_COTADO) BETWEEN '${dateIni}' AND '${dateFin}'
                AND AD_COTACAO.DATAAPROVACAO IS NOT NULL

                UNION ALL

                SELECT 
                'VALOR' AS TIPO,
                COALESCE(SUM(TGFCAB.VLRNOTA),0) AS RESULTADO
                FROM TGWSEP SEP
                INNER JOIN TGWSXN ON TGWSXN.NUSEPARACAO = SEP.NUSEPARACAO
                INNER JOIN TGFCAB ON TGWSXN.NUNOTA = TGFCAB.AD_PEDDESTINO
                INNER JOIN AD_COTACAO ON AD_COTACAO.NUNOTA = TGFCAB.NUNOTA 
                WHERE 
                CONVERT(DATE, AD_COTACAO.DH_COTADO) BETWEEN '${dateIni}' AND '${dateFin}'
                AND AD_COTACAO.DATAAPROVACAO IS NOT NULL
                        
                ORDER BY RESULTADO ASC
            `;
            JX.consultar(consulta).then((data: any) => {
                setData(data);
            });
        }

    }, [dateIni, dateFin]);


    const chartData = data
        .map((item: any) => ({
            opcao: item.TIPO === "PEDIDO" ? "Pedidos" :
                item.TIPO === "VALOR" ? "Valor" : item.TIPO,
            value: parseFloat(String(item.RESULTADO))
        }))
        .sort((a: any, b: any) => b.value - a.value);



    return (
        <Card>
            <CardHeader>
                <CardTitle>PEDIDOS CONFIRMADOS</CardTitle>
            </CardHeader>
            <CardContent>
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
                        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                        <Bar dataKey="value" fill={chartConfig.value.color} radius={5} minPointSize={1}>
                            <LabelList
                                dataKey="value"
                                position="right"
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
            </CardContent>
        </Card>
    );
};
