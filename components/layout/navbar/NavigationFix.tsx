'use client';
import {useEffect} from 'react';

export default function NavigationFix() {
    useEffect(() => {
        const logoLinks = document.querySelectorAll('a.flex.items-center');
        logoLinks.forEach(link => {
            link.addEventListener('click', e => {
                if (window.location.pathname.includes('/search')) {
                    e.preventDefault();
                    window.location.href = '/';
                }
            });
        });
    }, []);

    return null;
}