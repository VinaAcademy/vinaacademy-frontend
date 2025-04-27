import Link from "next/link";

interface MobileNavLinksProps {
  isAuthenticated: boolean;
  roleStaffAdmin: any;
  onClose: () => void;
}

const MobileNavLinks = ({ isAuthenticated, roleStaffAdmin, onClose }: MobileNavLinksProps) => {
  return (
    <div className="pb-4 border-b border-gray-200">
      <Link 
        href="/courses"
        className="block py-3 font-medium hover:text-gray-800"
        onClick={onClose}
      >
        Khóa học
      </Link>
      <Link 
        href="/instructors"
        className="block py-3 font-medium hover:text-gray-800"
        onClick={onClose}
      >
        Giảng viên
      </Link>
      {isAuthenticated && roleStaffAdmin && (
        <Link 
          href="/requests"
          className="block py-3 font-medium hover:text-gray-800"
          onClick={onClose}
        >
          Duyệt khóa học
        </Link>
      )}
    </div>
  );
};

export default MobileNavLinks;
