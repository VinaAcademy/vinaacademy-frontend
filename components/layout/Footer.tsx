import Link from 'next/link'
import { Icons } from '@/components/icons'
import { siteConfig } from '@/config/site.config'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="bg-base-200 text-base-content py-6 z-0">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center">
          {/* Logo and brand name */}
          <Link href="/" className="flex items-center mb-3">
            <Image
              src="/logo.png"
              alt="VinaAcademy Logo"
              width={24}
              height={24}
              className="h-6 w-6 text-primary mr-2"
            />
            <span className="text-xl font-bold">VinaAcademy</span>
          </Link>

          {/* Short description */}
          <p className="text-sm mb-4 max-w-md">
            Nền tảng học trực tuyến hàng đầu Việt Nam
          </p>

          {/* Essential links */}
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mb-4 text-sm">
            <Link href="#" className="link link-hover">
              Giới thiệu
            </Link>
            <Link href="/courses" className="link link-hover">
              Khóa học
            </Link>
            <Link href="#" className="link link-hover">
              Liên hệ
            </Link>
            <Link href="#" className="link link-hover">
              Điều khoản
            </Link>
            <Link href="#" className="link link-hover">
              Bảo mật
            </Link>
          </div>

          {/* Social links */}
          <div className="flex space-x-3 mb-4">
            {Object.entries(siteConfig.links).map(([key, url]) => (
              <a
                key={key}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                {key === 'facebook' ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    className="fill-current"
                  >
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path>
                  </svg>
                ) : key === 'twitter' ? (
                  <Icons.twitter className="h-5 w-5" />
                ) : key === 'linkedin' ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    className="fill-current"
                  >
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                ) : (
                  <Icons.gitHub className="h-5 w-5" />
                )}
              </a>
            ))}
          </div>

          {/* Copyright */}
          <p className="text-xs">
            &copy; {new Date().getFullYear()} VinaAcademy
          </p>
        </div>
      </div>
    </footer>
  )
}
