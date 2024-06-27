import { HeaderInsumos } from "./_components/HeaderInsumos";
import { TablaInsumos } from "./_components/TablaInsumos";

export default function Page() {
  return (
    <div className='container mx-auto py-10'>
      <HeaderInsumos />
      <TablaInsumos />
    </div>
  );
}
