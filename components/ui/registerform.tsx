"use client";

import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {useState} from "react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Form, FormField, FormItem, FormControl, FormMessage} from "@/components/ui/form";

// Icons
import {FaUserShield} from "react-icons/fa";
import {IoMdLock} from "react-icons/io";
import {MdOutlineDriveFileRenameOutline, MdEmail} from "react-icons/md";
import {RegisterRequest} from "@/types/auth";
import {createErrorToast, createSuccessToast} from "./toast-cus";
import Image from "next/image";
import Link from "next/link";

// Password regex: At least 8 characters, at least one uppercase letter, one lowercase letter, and one number
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

const formSchema = z.object({
    username: z.string().nonempty("Tên đăng nhập là bắt buộc").min(3, "Tên đăng nhập phải có ít nhất 3 ký tự"),
    fullname: z.string().nonempty("Họ và tên là bắt buộc").min(5, "Họ và tên phải có ít nhất 5 ký tự").max(50, "Họ và tên không được vượt quá 50 ký tự"),
    email: z.string().nonempty("Email là bắt buộc").email("Định dạng email không hợp lệ"),
    password: z.string()
        .nonempty("Mật khẩu là bắt buộc")
        .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
        .regex(PASSWORD_REGEX, "Mật khẩu phải chứa ít nhất một chữ hoa, một chữ thường và một số"),
    confirmPassword: z.string().nonempty("Vui lòng xác nhận mật khẩu"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
});

export type RegisterFormValues = z.infer<typeof formSchema>;

interface RegisterFormProps {
    heading?: string;
    subheading?: string;
    imageUrl?: string;
    registerText?: string;
    googleText?: string;
    signinText?: string;
    signinUrl?: string;
    onSubmit?: (data: RegisterRequest) => Promise<boolean>;
    isSubmitting?: boolean;
    error?: string | null;
}

export default function RegisterForm({
                                         heading = "VN Academy",
                                         subheading = "Tạo ngay cho mình một tài khoản",
                                         imageUrl = "https://img.freepik.com/free-vector/mobile-login-concept-illustration_114360-83.jpg?t=st=1745597272~exp=1745600872~hmac=667ac92fb131452d1c619cbe5cd84b2efdf074d9debbbe2ac16108c009b1d820&w=826",
                                         registerText = "Đăng ký",
                                         signinText = "Đã có tài khoản?",
                                         signinUrl = "/login",
                                         onSubmit,
                                         isSubmitting = false,
                                         error = null,
                                     }: RegisterFormProps) {
    const [submitError, setSubmitError] = useState<string | null>(error);

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            fullname: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    async function handleSubmit(data: RegisterFormValues) {
        if (!onSubmit) return;

        try {
            setSubmitError(null);

            const registerData: RegisterRequest = {
                fullName: data.fullname,
                email: data.email,
                password: data.password,
                retypedPassword: data.confirmPassword,
            };

            const success = await onSubmit(registerData);

            if (success) {
                createSuccessToast("Đăng ký thành công. Hãy kiểm tra email để xác thực tài khoản.");
                // Optionally redirect to login page
            }
        } catch (error) {
            console.error("Form submission error:", error);
            setSubmitError("Đã xảy ra lỗi trong quá trình đăng ký. Vui lòng thử lại sau.");
            createErrorToast("Đã xảy ra lỗi trong quá trình đăng ký. Vui lòng thử lại sau.");
        }
    }

    return (
        <section className="py-9 px-4 sm:px-8 flex flex-col items-center gap-4">
            <div
                className="w-full bg-white rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row min-h-[500px]">
                {/* Left Side - Form */}
                <div className="w-full md:w-1/2 flex flex-col justify-center px-10 py-8">
                    <div className="mb-6 text-center">
                        <p className="text-2xl font-bold">{heading}</p>
                        <p className="text-muted-foreground">{subheading}</p>
                    </div>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-4">
                            {submitError && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative"
                                     role="alert">
                                    <span className="block sm:inline">{submitError}</span>
                                </div>
                            )}

                            <FormField
                                control={form.control}
                                name="username"
                                render={({field}) => (
                                    <FormItem>
                                        <Label>Tên đăng nhập</Label>
                                        <FormControl>
                                            <Input type="text" placeholder="Nhập tên đăng nhập của bạn"
                                                   iconLeft={<FaUserShield/>} {...field} />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="fullname"
                                render={({field}) => (
                                    <FormItem>
                                        <Label>Họ và tên</Label>
                                        <FormControl>
                                            <Input type="text" placeholder="Nhập tên đầy đủ của bạn"
                                                   iconLeft={<MdOutlineDriveFileRenameOutline/>} {...field} />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({field}) => (
                                    <FormItem>
                                        <Label>Email</Label>
                                        <FormControl>
                                            <Input type="email" placeholder="Nhập email của bạn"
                                                   iconLeft={<MdEmail/>} {...field} />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({field}) => (
                                    <FormItem>
                                        <Label>Mật khẩu</Label>
                                        <FormControl>
                                            <Input type="password" placeholder="Nhập mật khẩu của bạn"
                                                   iconLeft={<IoMdLock/>} passwordEye={true} {...field} />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({field}) => (
                                    <FormItem>
                                        <Label>Xác nhận mật khẩu</Label>
                                        <FormControl>
                                            <Input type="password" placeholder="Xác nhận mật khẩu"
                                                   iconLeft={<IoMdLock/>} passwordEye={true} {...field} />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" className="mt-2 w-full bg-black text-white" disabled={isSubmitting}>
                                {isSubmitting ? "Đang đăng ký..." : registerText}
                            </Button>

                            {/* <div
                                className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-gray-500">
                                <span className="relative z-10 bg-white px-2 text-muted-foreground">Hoặc sử dụng tài khoản liên kết</span>
                            </div>

                            <Button type="button" variant="outline" className="w-full border-gray-400"
                                disabled={isSubmitting}>
                                <FcGoogle className="mr-2 size-5" />
                                {googleText}
                            </Button> */}
                        </form>
                    </Form>

                    <div className="mx-auto mt-6 flex justify-center gap-1 text-sm text-muted-foreground">
                        <p>{signinText}</p>
                        <Link href={signinUrl} className="font-medium text-primary hover:underline">
                            Đăng nhập
                        </Link>
                    </div>
                </div>

                {/* Right Side - Image */}
                <div className="hidden md:block md:w-1/2 bg-gray-200 items-center justify-center">
                    <Image
                        src={imageUrl}
                        alt="Register Illustration"
                        width={600}
                        height={600}
                        className="h-full w-full object-cover flex items-center justify-center"
                    />
                </div>
            </div>

            {/* Terms & Privacy Policy Text */}
            <div
                className="w-full text-center text-muted-foreground text-xs mt-2 [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
                By clicking continue, you agree to our <a className="" href="#">Terms of Service</a>{" "}
                and <a className="" href="#">Privacy Policy</a>.
            </div>
        </section>
    );
}

