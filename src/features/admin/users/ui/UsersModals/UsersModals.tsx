import { Modal } from "@/shared/ui";
import { AddUserForm } from "../AddUserForm";
import { EditUserForm } from "../EditUserForm";
import { useI18n } from "@/shared/i18n";
import type { T_UsersModalsProps } from "./types";

export const UsersModals = ({
  isAddUserOpen,
  selectedUser,
  onCloseAddUser,
  onCloseEditUser,
  onCreateUser,
  onUpdateUser,
}: T_UsersModalsProps) => {
  const { t } = useI18n();

  return (
    <>
      <Modal
        isOpen={isAddUserOpen}
        title={t("admin.user.addUserTitle")}
        onClose={onCloseAddUser}
      >
        <AddUserForm
          onCancel={onCloseAddUser}
          onCreate={onCreateUser}
        />
      </Modal>
      {selectedUser && (
        <Modal
          isOpen={Boolean(selectedUser)}
          title={t("admin.user.editUserTitle")}
          onClose={onCloseEditUser}
        >
          <EditUserForm
            user={selectedUser}
            onCancel={onCloseEditUser}
            onUpdate={onUpdateUser}
          />
        </Modal>
      )}
    </>
  );
};
