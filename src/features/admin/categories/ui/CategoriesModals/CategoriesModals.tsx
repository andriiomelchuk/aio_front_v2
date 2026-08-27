import { Modal } from "@/shared/ui";
import { useI18n } from "@/shared/i18n";
import type { T_CategoriesModalsProps } from "./types";
import { AddCategoryForm } from "../AddCategoryForm";
import { EditCategoryForm } from "../EditCategoryForm";


export const CategoriesModals = ({
  isAddCategoryOpen,
  selectedCategory,
  onCloseAddCategory,
  onCloseEditCategory,
  onCreateCategory,
  onUpdateCategory,
}: T_CategoriesModalsProps) => {
  const { t } = useI18n();

  return (
    <>
      <Modal
        isOpen={isAddCategoryOpen}
        title={t("admin.category.addCategoryTitle")}
        onClose={onCloseAddCategory}
      >
        <AddCategoryForm
          onCancel={onCloseAddCategory}
          onCreate={onCreateCategory}
        />
      </Modal>
      {selectedCategory && (
        <Modal
          isOpen={Boolean(selectedCategory)}
          title={t("admin.category.editCategoryTitle")}
          onClose={onCloseEditCategory}
        >
          <EditCategoryForm
            category={selectedCategory}
            onCancel={onCloseEditCategory}
            onUpdate={onUpdateCategory}
          />
        </Modal>
      )}

    </>
  );
};
