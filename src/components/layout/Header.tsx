import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebar } from '@/contexts/SidebarContext';
import { MoonIcon, SunIcon, LanguagesIcon, LogOutIcon, UserIcon, SettingsIcon, MenuIcon, ChevronLeftIcon } from 'lucide-react';

export function Header() {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, languages } = useLanguage();
  const { user, signOut, userRole } = useAuth();

  const { collapsed, toggleSidebar } = useSidebar();

  // Check if the user is a seller (sellers don't have a sidebar)
  const isSeller = userRole === 'seller';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between mx-auto px-6">
        <div className="flex items-center gap-2">
          {user && !isSeller ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="mr-2"
            >
              {collapsed ? <MenuIcon className="h-5 w-5" /> : <ChevronLeftIcon className="h-5 w-5" />}
              <span className="sr-only">Toggle sidebar</span>
            </Button>
          ) : (
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold text-primary">{t('app.name')}</span>
            </Link>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                {theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) ? (
                  <MoonIcon className="h-5 w-5" />
                ) : (
                  <SunIcon className="h-5 w-5" />
                )}
                <span className="sr-only">{t('settings.theme.title')}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t('settings.theme.title')}</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setTheme('light')}>
                <SunIcon className="mr-2 h-4 w-4" />
                <span>{t('settings.theme.light')}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}>
                <MoonIcon className="mr-2 h-4 w-4" />
                <span>{t('settings.theme.dark')}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')}>
                <span className="mr-2">💻</span>
                <span>{t('settings.theme.system')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <LanguagesIcon className="h-5 w-5" />
                <span className="sr-only">{t('settings.language')}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t('settings.language')}</DropdownMenuLabel>
              {languages.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={language === lang.code ? 'bg-accent text-accent-foreground' : ''}
                >
                  <span>{lang.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt={user.email || ''} />
                    <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.email}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {userRole && t(`users.roles.${userRole}`)}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {(userRole === 'admin' || userRole === 'superAdmin') && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/admin/users">
                        <UserIcon className="mr-2 h-4 w-4" />
                        <span>{t('users.title')}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/admin/settings">
                        <SettingsIcon className="mr-2 h-4 w-4" />
                        <span>{t('settings.title')}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOutIcon className="mr-2 h-4 w-4" />
                  <span>{t('auth.logout')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="default">
              <Link to="/login">{t('auth.login')}</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
