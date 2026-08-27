import React from "react";

export const HomeFooter: React.FC = () => {
  return (
    <footer className="border-t py-6 text-center text-xs text-muted-foreground bg-muted/20">
      <div className="container mx-auto px-4">
        <p>© {new Date().getFullYear()} AI Question Paper Generator — Built with Next.js, Flask, T5 &amp; BERT.</p>
      </div>
    </footer>
  );
};
