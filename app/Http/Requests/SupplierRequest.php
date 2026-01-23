<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SupplierRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $supplier = $this->route('supplier'); // may be null
        $supplierId = $supplier ? $supplier->id : null;

        return [
            'name' => 'required|string|max:191',
            'contact_person' => 'nullable|string|max:191',
            'email' => [
                'required',
                'email',
                'max:191',
                Rule::unique('suppliers', 'email')->ignore($supplierId),
            ],
            'phone' => [
                'required',
                'string',
                'max:50',
                Rule::unique('suppliers', 'phone')->ignore($supplierId),
            ],
            'address' => 'nullable|string',
            'tax_id' => [
                'nullable',
                'string',
                'max:100',
                Rule::unique('suppliers', 'tax_id')->ignore($supplierId),
            ],
            'notes' => 'nullable|string',
        ];
    }
}
