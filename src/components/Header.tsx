
import { motion } from "framer-motion";

interface HeaderProps {
  title: string;
  description?: string;
}

const Header = ({ title, description }: HeaderProps) => {
  return (
    <header className="px-4 pt-6 pb-4 sm:px-6 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="max-w-4xl mx-auto"
      >
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-display font-medium tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
      </motion.div>
    </header>
  );
};

export default Header;
