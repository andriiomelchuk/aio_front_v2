import { MenuBuilder } from "@/features/admin/menus";
export default async function EditMenuPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <MenuBuilder mode="edit" menuId={id} />; }
