"use client";

import { useEffect, useState, useTransition } from "react";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";

export interface CompanyItem {
  _id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  website?: string;
  createdAt?: string;
}

export default function CompanyManager() {
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<CompanyItem | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    logo: "",
    description: "",
    website: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Delete confirmation modal state
  const [companyToDelete, setCompanyToDelete] = useState<CompanyItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const fetchCompanies = async (query = "") => {
    try {
      setLoading(true);
      setError(null);
      const url = query
        ? `/api/companies?search=${encodeURIComponent(query)}`
        : "/api/companies";
      const res = await fetch(url);
      const json = await res.json();

      if (res.ok && json.success) {
        setCompanies(json.data || []);
      } else {
        setError(json.error || "Failed to load companies.");
      }
    } catch {
      setError("Network error fetching companies.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    async function init() {
      try {
        const res = await fetch("/api/companies");
        const json = await res.json();
        if (isMounted) {
          if (res.ok && json.success) {
            setCompanies(json.data || []);
          } else {
            setError(json.error || "Failed to load companies.");
          }
          setLoading(false);
        }
      } catch {
        if (isMounted) {
          setError("Network error fetching companies.");
          setLoading(false);
        }
      }
    }
    init();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCompanies(search);
  };

  // Open Create Modal
  const openCreateModal = () => {
    setEditingCompany(null);
    setFormData({
      name: "",
      slug: "",
      logo: "",
      description: "",
      website: "",
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (company: CompanyItem) => {
    setEditingCompany(company);
    setFormData({
      name: company.name || "",
      slug: company.slug || "",
      logo: company.logo || "",
      description: company.description || "",
      website: company.website || "",
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Auto-generate slug from name if creating
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData((prev) => {
      const updated = { ...prev, name: val };
      if (!editingCompany) {
        updated.slug = val
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-");
      }
      return updated;
    });
  };

  // Validate form client-side
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) {
      errors.name = "Company name is required";
    }
    if (!formData.slug.trim()) {
      errors.slug = "Slug is required";
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(formData.slug.trim())) {
      errors.slug = "Slug must contain only lowercase letters, numbers, and hyphens";
    }
    if (formData.logo && formData.logo.trim() !== "") {
      const val = formData.logo.trim();
      if (!val.startsWith("/")) {
        try {
          new URL(val);
        } catch {
          errors.logo = "Must be a valid URL or path (e.g. /logos/company.svg)";
        }
      }
    }
    if (formData.website && formData.website.trim() !== "") {
      try {
        new URL(formData.website.trim());
      } catch {
        errors.website = "Must be a valid URL";
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Create or Edit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      setFormErrors({});

      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim().toLowerCase(),
        logo: formData.logo.trim() || undefined,
        description: formData.description.trim() || undefined,
        website: formData.website.trim() || undefined,
      };

      let res: Response;
      if (editingCompany) {
        res = await fetch(`/api/companies/${editingCompany.slug}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/companies", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const json = await res.json();

      if (res.ok && json.success) {
        setIsModalOpen(false);
        setSuccessMessage(
          editingCompany
            ? `Company "${formData.name}" updated successfully.`
            : `Company "${formData.name}" created successfully.`
        );
        setTimeout(() => setSuccessMessage(null), 4000);
        startTransition(() => {
          fetchCompanies(search);
        });
      } else {
        if (json.details && Array.isArray(json.details)) {
          const apiErrors: Record<string, string> = {};
          json.details.forEach((d: { field?: string; message?: string }) => {
            if (d.field) apiErrors[d.field] = d.message || "Invalid value";
          });
          setFormErrors(apiErrors);
        } else {
          setFormErrors({ form: json.error || "Operation failed." });
        }
      }
    } catch {
      setFormErrors({ form: "Network error occurred." });
    } finally {
      setSubmitting(false);
    }
  };

  // Delete execution
  const handleDeleteCompany = async () => {
    if (!companyToDelete) return;

    try {
      setDeleting(true);
      setDeleteError(null);
      const res = await fetch(`/api/companies/${companyToDelete.slug}`, {
        method: "DELETE",
      });
      const json = await res.json();

      if (res.ok && json.success) {
        setCompanyToDelete(null);
        setSuccessMessage(`Company "${companyToDelete.name}" deleted successfully.`);
        setTimeout(() => setSuccessMessage(null), 4000);
        startTransition(() => {
          fetchCompanies(search);
        });
      } else {
        setDeleteError(json.error || "Failed to delete company.");
      }
    } catch {
      setDeleteError("Network error deleting company.");
    } finally {
      setDeleting(false);
    }
  };

  const inputClasses =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500";

  return (
    <div>
      {/* Notifications */}
      {successMessage && (
        <div
          role="status"
          className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300"
        >
          {successMessage}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
        >
          {error}
        </div>
      )}

      {/* Action Bar: Search & Create */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={handleSearchSubmit} className="flex max-w-md flex-1 items-center gap-2">
          <input
            id="company-search"
            type="text"
            placeholder="Search companies by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={inputClasses}
          />
          <Button type="submit" variant="secondary" className="shrink-0">
            Search
          </Button>
          {search && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSearch("");
                fetchCompanies("");
              }}
              className="shrink-0"
            >
              Clear
            </Button>
          )}
        </form>

        <Button onClick={openCreateModal} variant="primary" className="shrink-0">
          + Add Company
        </Button>
      </div>

      {/* Table / List */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {loading ? (
          <div className="py-16 text-center text-sm text-gray-500 dark:text-slate-400">
            Loading companies...
          </div>
        ) : companies.length === 0 ? (
          <div className="py-12">
            <EmptyState
              title={search ? "No matching companies found" : "No companies yet"}
              description={
                search
                  ? `No companies match "${search}". Try another search or clear the filter.`
                  : "Get started by adding the first hiring company."
              }
              action={
                !search ? (
                  <Button onClick={openCreateModal} variant="primary">
                    + Add Company
                  </Button>
                ) : undefined
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left text-sm dark:divide-slate-800">
              <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:bg-slate-800/60 dark:text-slate-400">
                <tr>
                  <th scope="col" className="px-6 py-3.5">
                    Company
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Slug
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Website
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                {companies.map((c) => (
                  <tr
                    key={c._id}
                    className="hover:bg-gray-50/80 transition-colors dark:hover:bg-slate-800/40"
                  >
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-3">
                        {c.logo ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={c.logo}
                            alt={`${c.name} logo`}
                            className="h-8 w-8 rounded-lg border border-gray-200 bg-gray-50 p-1 object-contain dark:border-slate-700 dark:bg-slate-800"
                            onError={(e) => {
                              const target = e.currentTarget;
                              target.style.display = "none";
                              const fallback = target.nextElementSibling as HTMLElement | null;
                              if (fallback) fallback.style.display = "flex";
                            }}
                          />
                        ) : null}
                        <div
                          className={`h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-xs font-bold text-indigo-600 border border-indigo-100 dark:bg-indigo-950 dark:text-indigo-400 dark:border-indigo-900 ${
                            c.logo ? "hidden" : "flex"
                          }`}
                        >
                          {c.name.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-slate-100">
                          {c.name}
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 font-mono text-xs text-gray-500 dark:text-slate-400">
                      {c.slug}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-xs">
                      {c.website ? (
                        <a
                          href={c.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 hover:underline dark:text-indigo-400"
                        >
                          Visit site &rarr;
                        </a>
                      ) : (
                        <span className="text-gray-400 dark:text-slate-500">—</span>
                      )}
                    </td>
                    <td className="max-w-xs truncate px-6 py-4 text-xs text-gray-500 dark:text-slate-400">
                      {c.description || "—"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(c)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => {
                            setCompanyToDelete(c);
                            setDeleteError(null);
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm"
        >
          <div className="relative w-full max-w-lg rounded-xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">
              {editingCompany ? "Edit Company" : "Create New Company"}
            </h2>
            <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
              {editingCompany
                ? `Updating details for "${editingCompany.name}".`
                : "Enter company name, unique slug, and optional brand details."}
            </p>

            {formErrors.form && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
                {formErrors.form}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="mt-4 space-y-4">
              <div>
                <label
                  htmlFor="comp-name"
                  className="block text-xs font-semibold text-gray-700 dark:text-slate-300"
                >
                  Company Name *
                </label>
                <input
                  id="comp-name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleNameChange}
                  placeholder="e.g. Google, Amazon, Microsoft"
                  className={`${inputClasses} mt-1 ${formErrors.name ? "border-red-500 dark:border-red-500" : ""}`}
                />
                {formErrors.name && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.name}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="comp-slug"
                  className="block text-xs font-semibold text-gray-700 dark:text-slate-300"
                >
                  Slug * (lowercase, letters, numbers, hyphens)
                </label>
                <input
                  id="comp-slug"
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      slug: e.target.value.toLowerCase(),
                    }))
                  }
                  placeholder="e.g. google"
                  className={`${inputClasses} mt-1 font-mono text-sm ${formErrors.slug ? "border-red-500 dark:border-red-500" : ""}`}
                />
                {formErrors.slug && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.slug}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="comp-logo"
                  className="block text-xs font-semibold text-gray-700 dark:text-slate-300"
                >
                  Logo URL or Static Asset Path (optional)
                </label>
                <input
                  id="comp-logo"
                  type="text"
                  value={formData.logo}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, logo: e.target.value }))
                  }
                  placeholder="/logos/company.svg or https://example.com/logo.png"
                  className={`${inputClasses} mt-1 ${formErrors.logo ? "border-red-500 dark:border-red-500" : ""}`}
                />
                {formErrors.logo && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.logo}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="comp-website"
                  className="block text-xs font-semibold text-gray-700 dark:text-slate-300"
                >
                  Official Website (optional)
                </label>
                <input
                  id="comp-website"
                  type="url"
                  value={formData.website}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, website: e.target.value }))
                  }
                  placeholder="https://example.com"
                  className={`${inputClasses} mt-1 ${formErrors.website ? "border-red-500 dark:border-red-500" : ""}`}
                />
                {formErrors.website && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.website}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="comp-desc"
                  className="block text-xs font-semibold text-gray-700 dark:text-slate-300"
                >
                  Description (optional)
                </label>
                <textarea
                  id="comp-desc"
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Brief description of the company..."
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
                />
                {formErrors.description && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {formErrors.description}
                  </p>
                )}
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={submitting}>
                  {submitting
                    ? "Saving..."
                    : editingCompany
                    ? "Save Changes"
                    : "Create Company"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {companyToDelete && (
        <div
          role="alertdialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm"
        >
          <div className="relative w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100">
              Delete Company &ldquo;{companyToDelete.name}&rdquo;?
            </h3>
            <p className="mt-2 text-xs text-gray-500 dark:text-slate-400">
              Are you sure you want to delete this company? If questions are currently associated with this company, the deletion will be blocked to maintain database integrity.
            </p>

            {deleteError && (
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs font-medium text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300">
                {deleteError}
              </div>
            )}

            <div className="mt-6 flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setCompanyToDelete(null);
                  setDeleteError(null);
                }}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteCompany}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Confirm Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
